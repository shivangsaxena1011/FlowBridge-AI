'use client';

import React from 'react';
import { Modal } from '@/ui/modal';
import { CaptureBox } from '@/components/inbox/CaptureBox';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCaptureModal({ isOpen, onClose }: QuickCaptureModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Capture"
      description="Drop ideas, voice transcripts, screenshots, or notes. FlowBridge will convert them to structured work."
      maxWidth="lg"
    >
      <div className="pt-1">
        <CaptureBox
          autoFocus={isOpen}
          onSuccess={() => {
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
