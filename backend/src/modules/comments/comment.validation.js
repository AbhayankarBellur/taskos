import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty").max(5000)
});
