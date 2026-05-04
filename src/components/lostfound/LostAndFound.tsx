import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Inbox,
  XCircle,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { startDM } from "@/components/chat/NewDMSearch";

interface LostFoundItem {
  id: string;
  user_id: string;
  item_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  verification_question: string | null;
  created_at: string;
}

interface ClaimRow {
  id: string;
  item_id: string;
  claimer_id: string;
  proof_message: string;
  verification_answer: string | null;
  status: string;
  created_at: string;
  item?: LostFoundItem;
}

interface LostAndFoundProps {
  onNavigateToDM?: (
    room: { id: string; name: string; type: string; join_code: string | null },
    prefillMessage?: string
  ) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const LostAndFound: React.FC<LostAndFoundProps> = ({ onNavigateToDM }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Post modal
  const [modalOpen, setModalOpen] = useState(false);
  const [itemType, setItemType] = useState<"lost" | "found">("found");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [verificationQuestion, setVerificationQuestion] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Claim modal
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);
  const [claimAnswer, setClaimAnswer] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  // Approval dashboard
  const [incomingClaims, setIncomingClaims] = useState<ClaimRow[]>([]);
  const [processingClaim, setProcessingClaim] = useState<string | null>(null);

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
      .in("status", ["open", "pending"])
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("item_type", filter);

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error loading items", description: error.message, variant: "destructive" });
    } else {
      setItems((data || []) as LostFoundItem[]);
      const userIds = [...new Set((data || []).map((i) => i.user_id))];
      if (userIds.length > 0) {
        const { data: names } = await supabase.rpc("get_usernames_by_ids", { _user_ids: userIds });
        const map: Record<string, string> = {};
        (names || []).forEach((n: any) => (map[n.user_id] = n.username));
        setUsernames(map);
      }
    }
    setLoading(false);
  }, [filter, toast]);

  const fetchIncomingClaims = useCallback(async () => {
    if (!currentUserId) return;
    // Get items I posted
    const { data: myItems } = await supabase
      .from("lost_found_items")
      .select("*")
      .eq("user_id", currentUserId);
    const itemIds = (myItems || []).map((i) => i.id);
    if (itemIds.length === 0) {
      setIncomingClaims([]);
      return;
    }
    const { data: claims } = await supabase
      .from("lost_found_claims")
      .select("*")
      .in("item_id", itemIds)
      .order("created_at", { ascending: false });

    const claimerIds = [...new Set((claims || []).map((c) => c.claimer_id))];
    if (claimerIds.length > 0) {
      const { data: names } = await supabase.rpc("get_usernames_by_ids", { _user_ids: claimerIds });
      const map: Record<string, string> = { ...usernames };
      (names || []).forEach((n: any) => (map[n.user_id] = n.username));
      setUsernames(map);
    }

    const itemMap = new Map((myItems || []).map((i: any) => [i.id, i]));
    setIncomingClaims(
      ((claims || []) as any[]).map((c) => ({ ...c, item: itemMap.get(c.item_id) }))
    );
  }, [currentUserId]); // eslint-disable-line

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchIncomingClaims();
  }, [fetchIncomingClaims]);

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
    if (!verificationQuestion.trim() || verificationQuestion.trim().length < 8) {
      toast({
        title: "Security question required",
        description: "Add a question only the true owner could answer.",
        variant: "destructive",
      });
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
        const { data: urlData } = supabase.storage.from("lost-and-found").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("lost_found_items").insert({
        user_id: user.id,
        item_type: itemType,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        verification_question: verificationQuestion.trim(),
      });
      if (error) throw error;

      toast({ title: "Item posted!" });
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setVerificationQuestion("");
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

  const submitClaim = async () => {
    if (!claimItem || !currentUserId) return;
    if (claimAnswer.trim().length < 2) {
      toast({ title: "Please answer the question", variant: "destructive" });
      return;
    }
    setClaimSubmitting(true);
    try {
      const { error: claimErr } = await supabase.from("lost_found_claims").insert({
        item_id: claimItem.id,
        claimer_id: currentUserId,
        proof_message: claimAnswer.trim(),
        verification_answer: claimAnswer.trim(),
      });
      if (claimErr) throw claimErr;

      await supabase.from("user_notifications").insert({
        user_id: claimItem.user_id,
        title: "New ownership claim",
        description: `Someone submitted an answer for "${claimItem.title}". Review it in Lost & Found → Claims.`,
        link: "/lost-found",
      });

      toast({ title: "Claim submitted for review!" });
      setClaimItem(null);
      setClaimAnswer("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClaimSubmitting(false);
    }
  };

  const approveClaim = async (claim: ClaimRow) => {
    if (!claim.item || !currentUserId) return;
    setProcessingClaim(claim.id);
    try {
      // 1. Approve claim
      const { error: cErr } = await supabase
        .from("lost_found_claims")
        .update({ status: "approved" })
        .eq("id", claim.id);
      if (cErr) throw cErr;

      // 2. Set item to pending
      await supabase
        .from("lost_found_items")
        .update({ status: "pending" })
        .eq("id", claim.item.id);

      // 3. Create DM between finder and claimant
      const claimantName = usernames[claim.claimer_id] || "claimant";
      const room = await startDM(claim.claimer_id, claimantName);

      // 4. Notify claimant
      await supabase.from("user_notifications").insert({
        user_id: claim.claimer_id,
        title: "Your claim was approved!",
        description: `Your claim on "${claim.item.title}" was approved. Chat opened to arrange the return.`,
        link: "/chat",
      });

      toast({ title: "Approved!", description: "Private chat opened with the claimant." });
      fetchIncomingClaims();
      fetchItems();

      if (room && onNavigateToDM) {
        onNavigateToDM(
          room,
          `Hi! I approved your claim for "${claim.item.title}". Let's arrange the return.`
        );
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessingClaim(null);
    }
  };

  const rejectClaim = async (claim: ClaimRow) => {
    setProcessingClaim(claim.id);
    try {
      const { error } = await supabase
        .from("lost_found_claims")
        .update({ status: "rejected" })
        .eq("id", claim.id);
      if (error) throw error;
      await supabase.from("user_notifications").insert({
        user_id: claim.claimer_id,
        title: "Claim rejected",
        description: `Your claim on "${claim.item?.title || "an item"}" was rejected by the finder.`,
      });
      toast({ title: "Claim rejected" });
      fetchIncomingClaims();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessingClaim(null);
    }
  };

  const pendingClaims = incomingClaims.filter((c) => c.status === "pending");

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
              <Plus className="h-4 w-4 mr-1" /> Post Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/90">
            <DialogHeader>
              <DialogTitle>Post an Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                placeholder="Item title (e.g., Black iPhone 13)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <Textarea
                placeholder="Public description (location, generic details...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Security Question <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="e.g., What is the lock screen wallpaper? What's engraved on the back?"
                  value={verificationQuestion}
                  onChange={(e) => setVerificationQuestion(e.target.value)}
                  maxLength={250}
                  rows={2}
                  className="border-primary/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Only the true owner should be able to answer this. Don't reveal the answer in the description.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-muted-foreground/30 rounded-md p-3 hover:bg-muted/50 transition-colors">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : "Upload image (max 2MB)"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Post Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="browse">
            <PackageSearch className="h-4 w-4 mr-1.5" /> Browse
          </TabsTrigger>
          <TabsTrigger value="claims" className="relative">
            <Inbox className="h-4 w-4 mr-1.5" /> My Claims
            {pendingClaims.length > 0 && (
              <Badge className="ml-2 h-5 min-w-5 px-1.5 text-[10px]">{pendingClaims.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          {/* Search & filters */}
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
                <Card
                  key={item.id}
                  className="overflow-hidden backdrop-blur-md bg-card/70 border-border/50 hover:border-primary/40 transition-all hover:shadow-lg"
                >
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
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                      <Badge
                        variant={item.item_type === "lost" ? "destructive" : "default"}
                        className="shrink-0 text-xs"
                      >
                        {item.item_type === "lost" ? "Lost" : "Found"}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    )}
                    {item.verification_question && (
                      <div className="flex items-start gap-1.5 text-[11px] text-primary/80 mb-3 bg-primary/5 rounded-md p-2 border border-primary/10">
                        <ShieldCheck className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>Verification required to claim</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mb-3">
                      by {usernames[item.user_id] || "Unknown"} ·{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                      {item.status === "pending" && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          Pending return
                        </Badge>
                      )}
                    </p>
                    <div className="flex gap-2">
                      {item.user_id === currentUserId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => handleResolve(item.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Mark Resolved
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setClaimAnswer("");
                            setClaimItem(item);
                          }}
                          disabled={item.status !== "open"}
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Claim
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          {incomingClaims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No claims on your items yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingClaims.map((claim) => (
                <Card
                  key={claim.id}
                  className="backdrop-blur-md bg-card/70 border-border/50"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm">{claim.item?.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Claim from{" "}
                          <span className="font-medium text-foreground">
                            {usernames[claim.claimer_id] || "Unknown"}
                          </span>{" "}
                          · {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          claim.status === "approved"
                            ? "default"
                            : claim.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] capitalize"
                      >
                        {claim.status}
                      </Badge>
                    </div>

                    {claim.item?.verification_question && (
                      <div className="bg-muted/40 rounded-md p-3 space-y-2 border border-border/50">
                        <div className="flex items-start gap-1.5 text-xs">
                          <HelpCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">Your question:</p>
                            <p className="text-muted-foreground italic">
                              "{claim.item.verification_question}"
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs pt-2 border-t border-border/50">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">Their answer:</p>
                            <p className="text-foreground/90 whitespace-pre-wrap">
                              {claim.verification_answer || claim.proof_message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {claim.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => approveClaim(claim)}
                          disabled={processingClaim === claim.id}
                        >
                          {processingClaim === claim.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Approve & Open Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectClaim(claim)}
                          disabled={processingClaim === claim.id}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {claim.status === "approved" && (
                      <div className="flex items-center gap-1.5 text-xs text-primary">
                        <MessageCircle className="h-3 w-3" /> Chat opened with claimant
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Claim Modal */}
      <Dialog open={!!claimItem} onOpenChange={(o) => !o && setClaimItem(null)}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/90">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Verify Ownership
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Answer the finder's security question to claim{" "}
              <span className="font-medium text-foreground">"{claimItem?.title}"</span>.
            </p>
            {claimItem?.verification_question && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground">
                    {claimItem.verification_question}
                  </p>
                </div>
              </div>
            )}
            <Textarea
              placeholder="Type your answer..."
              value={claimAnswer}
              onChange={(e) => setClaimAnswer(e.target.value)}
              maxLength={500}
              rows={4}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              The finder will review your answer privately. They never see your guess until you submit.
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
