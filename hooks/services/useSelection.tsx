import {createContext, useContext, useState, ReactNode} from "react";

// Define the shape of selections
interface ISelections {
	selectedCar: string;
	selectedModel: string;
	selectedService: string;
	selectedDay: string;
	selectedTime: string;
}

// Define the context type
interface ISelectionsContext {
	selections: ISelections;
	setSelections: React.Dispatch<React.SetStateAction<ISelections>>;
}

// Create a context
const SelectionContext = createContext<ISelectionsContext | undefined>(undefined);

// Create a provider component
export const SelectionProvider = ({ children }: { children: ReactNode }) => {
	const [selections, setSelections] = useState<ISelections>({
		selectedCar: "",
		selectedModel: "",
		selectedService: "",
		selectedDay: "",
		selectedTime: "",
	});

	return (
	<SelectionContext.Provider value={{ selections, setSelections }}>
			{children}
	</SelectionContext.Provider>
);
};

export const useSelection = () => {
	const context = useContext(SelectionContext);
	if (!context) {
		throw new Error("useSelection must be used within a SelectionProvider");
	}
	return context;
};
