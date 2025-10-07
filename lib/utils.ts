import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {z} from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const fileSchema = z
		.instanceof(File, {message: 'Not a valid file format!'})
		.refine((file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type), {
			message: "Only JPEG, JPG and PNG files are allowed",
		})
		.refine((file) => file.size <= 5 * 1024 * 1024, {
			message: "File size must be less than 5MB",
		});
