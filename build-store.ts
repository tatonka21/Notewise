import create from 'zustand';

interface BuildStatus {
    status: string;
    history: Array<{ date: string; status: string }>;  
}

interface BuildStore extends BuildStatus {
    setStatus: (newStatus: string) => void;
    addHistory: (statusItem: { date: string; status: string }) => void;
}

const useBuildStore = create<BuildStore>((set) => ({
    status: 'idle',
    history: [],
    setStatus: (newStatus) => set({ status: newStatus }),
    addHistory: (statusItem) => set(state => ({ history: [...state.history, statusItem] })),
}));

export default useBuildStore;
