import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { TaskComment } from "@/types/task";

type Props = {
  comments: TaskComment[];
  onAdd: (content: string) => void;
};

export function TaskComments({ comments, onAdd }: Props) {
  const [content, setContent] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(content.trim());
    setContent("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded bg-gray-50 p-2 text-xs text-gray-700">
            <span className="font-semibold text-gray-900">User: </span>
            {c.content}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit" variant="secondary" className="text-xs">Post</Button>
      </form>
    </div>
  );
}
