import { Timestamp } from "firebase/firestore";
import { CreateHeistInput } from "@/types/firestore";

export interface HeistFormData {
  title: string;
  description: string;
  assignedTo: string;
}

/**
 * Creates a CreateHeistInput with 48-hour deadline from now
 */
export function createHeist(
  formData: HeistFormData,
  createdBy: string,
  createdByCodename: string,
  assignedToCodename: string,
): CreateHeistInput {
  const now = new Date();
  const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

  return {
    title: formData.title,
    description: formData.description,
    createdBy,
    createdByCodename,
    assignedTo: formData.assignedTo,
    assignedToCodename,
    createdAt: Timestamp.now(),
    deadline: Timestamp.fromDate(deadline),
    finalStatus: null,
  };
}
