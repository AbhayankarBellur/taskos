import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Input } from "../ui/input";
import { TaskAssessment as AssessmentType } from "@/types/task";

type Props = {
  assessments: AssessmentType[];
  onAdd: (data: Partial<AssessmentType>) => void;
};

export function TaskAssessment({ assessments, onAdd }: Props) {
  const [points, setPoints] = useState("3");
  const [hours, setHours] = useState("4");
  const [comp, setComp] = useState<"low" | "medium" | "high">("medium");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onAdd({
      complexity: comp, storyPoints: parseInt(points, 10),
      estimatedHours: parseFloat(hours), risk: "low", confidence: 80
    });
  };

  const latest = assessments[0];
  return (
    <div className="flex flex-col gap-3">
      {latest && (
        <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
          <div className="font-semibold">Latest Assessment</div>
          <div>Points: {latest.storyPoints} | Est: {latest.estimatedHours}h | Complexity: {latest.complexity}</div>
        </div>
      )}
      <form onSubmit={submit} className="flex gap-2 items-end">
        <Select
          label="Points" value={points} onChange={(e) => setPoints(e.target.value)}
          options={[1, 2, 3, 5, 8, 13].map((n) => ({ value: String(n), label: `${n} pts` }))}
        />
        <Input label="Hours" type="number" value={hours} onChange={(e) => setHours(e.target.value)} />
        <Select
          label="Complexity" value={comp} onChange={(e) => setComp(e.target.value as "low" | "medium" | "high")}
          options={[{ value: "low", label: "Low" }, { value: "medium", label: "Med" }, { value: "high", label: "High" }]}
        />
        <Button type="submit" variant="secondary" className="text-xs py-2">Assess</Button>
      </form>
    </div>
  );
}
