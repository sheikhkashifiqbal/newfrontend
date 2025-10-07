import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputExtProps {
	className?: string;
	placeholder?: string;
}

export default function InputExt({
																	 className = "",
																	 placeholder = "Enter text...",
																 }: InputExtProps) {
	return (
			<Input
					placeholder={placeholder}
					className={cn(
							"!ring-transparent !outline-transparent focus-visible:ring-transparent focus-visible:ring-offset-0",
							className
					)}
			/>
	);
}
