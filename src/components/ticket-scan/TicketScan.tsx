import { useRef, useState, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { SCAN_STRINGS } from '../../i18n/ui';
import type { ChatImage } from '../../features/chat/types';

function dataUrlToImage(dataUrl: string): ChatImage | null {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match || !match[1] || !match[2]) return null;
  return { mimeType: match[1], data: match[2] };
}

export function TicketScan() {
  const { context } = useFanContext();
  const { send, isStreaming } = useChatContext();
  const s = SCAN_STRINGS[context.language];
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (preview) {
      const image = dataUrlToImage(preview);
      if (image) void send('Scan my ticket and find my seat.', image);
    }
    setOpen(false);
    setPreview(null);
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={onFile}
      />
      <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={isStreaming}>
        <Camera size={16} aria-hidden="true" />
        {s.button}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby="scan-desc">
          <DialogTitle>{s.button}</DialogTitle>
          <DialogDescription id="scan-desc" className="mt-2">
            {s.hint}
          </DialogDescription>
          {preview ? (
            <img
              src={preview}
              alt=""
              className="mt-4 max-h-64 w-full rounded-md border border-border object-contain"
            />
          ) : null}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setPreview(null); }}>
              {s.cancel}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              {s.retake}
            </Button>
            <Button size="sm" onClick={submit}>
              {s.use}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
