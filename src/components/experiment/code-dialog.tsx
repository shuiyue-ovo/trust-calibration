"use client";

// ============================================================
// 实验模式密码验证弹窗
// ============================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlaskConical, Key, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const CORRECT_CODE = "060624";

interface CodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodeDialog({ open, onOpenChange }: CodeDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    if (code.trim() === CORRECT_CODE) {
      setError(false);
      setCode("");
      onOpenChange(false);
      router.push("/experiment-mode");
    } else {
      setError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCode("");
      setError(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <FlaskConical className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center">实验模式</DialogTitle>
          <DialogDescription className="text-center">
            请输入被试编号或访问密码以进入实验
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-2">
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs">
              访问密码
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                id="code"
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="请输入密码"
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="size-3.5 shrink-0" />
              密码错误，请重试
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full rounded-xl" disabled={!code.trim()}>
            确认进入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
