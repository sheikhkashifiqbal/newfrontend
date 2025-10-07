import { create } from "zustand";

type HamburgerStoreType = {
	isOpen: boolean;
	toggle: () => void;
	open: () => void;
	close: () => void;
};

const useHamburgerStore = create<HamburgerStoreType>((set) => ({
	isOpen: false,
	toggle: () => set((state) => ({ isOpen: !state.isOpen })),
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
}));

export default useHamburgerStore;
