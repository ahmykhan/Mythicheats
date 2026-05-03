import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ImagePlus,
  Loader2,
  CheckCircle,
  PackageSearch,
  MapPin,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

interface LostFoundItem {
  id: string;
  user_id: string;
  item_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

interface LostAndFoundProps {
  onNavigateToDM?: (
    room: { id: string; name: string; type: string; join_code: string | null },
    prefillMessage?: string
  ) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const LostAndFound: React.FC<LostAndFoundProps> = ({ onNavigateToDM }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [itemType, setItemType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Drop-off modal (I found this!)
  const [dropoffItem, setDropoffItem] = useState<LostFoundItem | null>(null);
  const [dropoffRefId, setDropoffRefId] = useState<string>("");
  const [dropoffSubmitting, setDropoffSubmitting] = useState(false);

  // Claim modal (That is mine!)
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);
  const [claimProof, setClaimProof] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("lost_found_items")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("item_type", filter);

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error loading items", description: error.message, variant: "destructive" });
    } else {
      setItems(data || []);
      // Fetch usernames for all unique user_ids
      const userIds = [...new Set((data || []).map((i) => i.user_id))];
      if (userIds.length > 0) {
        const { data: names } = await supabase.rpc("get_usernames_by_ids", {
          _user_ids: userIds,
        });
        const map: Record<string, string> = {};
        (names || []).forEach((n) => (map[n.user_id] = n.username));
        setUsernames(map);
      }
    }
    setLoading(false);
  }, [filter, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Max file size is 2MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSubmitting(true);
    let imageUrl: string | null = null;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("lost-and-found")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("lost-and-found")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("lost_found_items").insert({
        user_id: user.id,
        item_type: itemType,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({ title: "Item reported!" });
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setImageFile(null);
      fetchItems();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (itemId: string) => {
    const { error } = await supabase
      .from("lost_found_items")
      .update({ status: "resolved" })
      .eq("id", itemId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as resolved!" });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const openDropoffModal = (item: LostFoundItem) => {
    const refId = Math.floor(1000 + Math.random() * 9000).toString();
    setDropoffRefId(refId);
    setDropoffItem(item);
  };

  const confirmDropoff = async () => {
    if (!dropoffItem || !currentUserId) return;
    setDropoffSubmitting(true);
    try {
      const { error: updErr } = await supabase
        .from("lost_found_items")
        .update({
          status: "at_admin_desk",
          reference_id: dropoffRefId,
          dropped_by: currentUserId,
        })
        .eq("id", dropoffItem.id);
      if (updErr) throw updErr;

      const { error: notifErr } = await supabase.from("user_notifications").insert({
        user_id: dropoffItem.user_id,
        title: "Your item has been found!",
        description: `"${dropoffItem.title}" was dropped off at the Campus Admin Desk. Reference ID: ${dropoffRefId}. Please collect it from the admin office.`,
        link: "/lost-found",
      });
      if (notifErr) throw notifErr;

      toast({
        title: "Drop-off confirmed!",
        description: `Reference ID ${dropoffRefId} recorded. The owner has been notified.`,
      });
      setDropoffItem(null);
      setDropoffRefId("");
      fetchItems();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDropoffSubmitting(false);
    }
  };

  const submitClaim = async () => {
    if (!claimItem || !currentUserId) return;
    if (claimProof.trim().length < 10) {
      toast({
        title: "More detail needed",
        description: "Please describe a unique detail (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }
    setClaimSubmitting(true);
    try {
      const { error: claimErr } = await supabase.from("lost_found_claims").insert({
        item_id: claimItem.id,
        claimer_id: currentUserId,
        proof_message: claimProof.trim(),
      });
      if (claimErr) throw claimErr;

      const claimerName = "A user";
      await supabase.from("user_notifications").insert({
        user_id: claimItem.user_id,
        title: "New ownership claim",
        description: `${claimerName} submitted a claim for "${claimItem.title}". Review their proof in the Lost & Found.`,
        link: "/lost-found",
      });

      toast({ title: "Claim sent to the finder for verification!" });
      setClaimItem(null);
      setClaimProof("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClaimSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <PackageSearch className="h-5 w-5" />
          Lost & Found
        </h2>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Report Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report an Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={itemType === "lost" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemType("lost")}
                  className="flex-1"
                >
                  <MapPin className="h-4 w-4 mr-1" /> Lost
                </Button>
                <Button
                  variant={itemType === "found" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemType("found")}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Found
                </Button>
              </div>
              <Input
                placeholder="Item title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <Textarea
                placeholder="Description (location, details...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <div>
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-muted-foreground/30 rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {imageFile ? imageFile.name : "Upload image (max 2MB)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "lost", "found"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <PackageSearch className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <CardContent className={item.image_url ? "p-4" : "p-4"}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                  <Badge variant={item.item_type === "lost" ? "destructive" : "default"} className="shrink-0 text-xs">
                    {item.item_type === "lost" ? "Lost" : "Found"}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                )}
                <p className="text-xs text-muted-foreground mb-3">
                  by {usernames[item.user_id] || "Unknown"} · {new Date(item.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  {item.user_id === currentUserId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => handleResolve(item.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Mark as Resolved
                    </Button>
                  ) : item.item_type === "lost" ? (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => openDropoffModal(item)}
                    >
                      <PackageCheck className="h-3 w-3 mr-1" />
                      I found this!
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setClaimItem(item)}
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      That is mine!
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Drop-off Modal */}
      <Dialog open={!!dropoffItem} onOpenChange={(o) => !o && setDropoffItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" /> Thank you!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please drop this item off at the <span className="font-semibold text-foreground">Campus Admin Desk</span>.
              Show this Reference ID when handing it over.
            </p>
            <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 py-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reference ID</p>
              <p className="text-5xl font-bold tracking-widest text-primary">{dropoffRefId}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              The owner of <span className="font-medium text-foreground">"{dropoffItem?.title}"</span> will be notified once you confirm.
            </p>
            <Button onClick={confirmDropoff} disabled={dropoffSubmitting} className="w-full">
              {dropoffSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Confirm Drop-off
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claim Modal */}
      <Dialog open={!!claimItem} onOpenChange={(o) => !o && setClaimItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Verify Ownership
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To claim <span className="font-medium text-foreground">"{claimItem?.title}"</span>, describe a unique detail
              about this item to prove it belongs to you (e.g., a scratch, sticker, contents, serial number).
            </p>
            <Textarea
              placeholder="Describe a unique detail about this item..."
              value={claimProof}
              onChange={(e) => setClaimProof(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {claimProof.length}/500 characters
            </p>
            <Button onClick={submitClaim} disabled={claimSubmitting} className="w-full">
              {claimSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Submit Claim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostAndFound;
