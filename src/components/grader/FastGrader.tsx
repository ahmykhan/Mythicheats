import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateFastGrade } from "@/lib/fastGraderLogic";
import { GraduationCap, TrendingDown, TrendingUp, Calculator } from "lucide-react";

const FastGrader: React.FC = () => {
  const [mca, setMca] = useState("");
  const [score, setScore] = useState("");

  const result = useMemo(() => {
    if (!mca || !score) return null;
    const grades = calculateFastGrade(mca, score);
    if (grades[0] === "?" && grades[1] === "?" && grades[2] === "?") return null;
    return grades;
  }, [mca, score]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">FAST Grade Calculator</CardTitle>
          <CardDescription>Enter your MCA average and score to see your grade boundaries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mca" className="text-foreground">MCA Average (30–91)</Label>
              <Input
                id="mca"
                type="number"
                min={30}
                max={91}
                placeholder="e.g. 65"
                value={mca}
                onChange={(e) => setMca(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score" className="text-foreground">Your Score</Label>
              <Input
                id="score"
                type="number"
                placeholder="e.g. 72"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Previous boundary */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Drop to</p>
              <p className="text-xl font-bold text-foreground">{result[1] === "-" ? "N/A" : result[1]}</p>
            </CardContent>
          </Card>

          {/* Current grade */}
          <Card className="border-primary/50 bg-primary/5 ring-1 ring-primary/20">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Grade</p>
              <p className="text-2xl font-bold text-primary">{result[0]}</p>
            </CardContent>
          </Card>

          {/* Next boundary */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Improve to</p>
              <p className="text-xl font-bold text-foreground">{result[2] === "-" ? "N/A" : result[2]}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!result && mca && score && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-destructive">Invalid input. MCA must be between 30–91.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FastGrader;
