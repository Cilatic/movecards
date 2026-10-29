import * as Dialog from "@radix-ui/react-dialog";
import { PillButton } from "./ui";

export function QuickHelp({ onClose }: { onClose: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-night/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[28rem] -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-card bg-card p-6 shadow-float">
          <Dialog.Title className="text-section">About Move Cards</Dialog.Title>
          <Dialog.Description className="text-[1.05rem]">Move Cards is your companion for gentle exercise. Follow a card’s steps and save what you’ve done in History.</Dialog.Description>
          <p className="text-[1.05rem]">On Home, choose <strong>Me</strong> for your own exercises, or <strong>Helping someone</strong> to guide another person. You can switch at any time.</p>
          <Dialog.Close asChild><PillButton>Got it</PillButton></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}