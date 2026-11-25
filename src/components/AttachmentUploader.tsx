import React, { useRef } from 'react';
import { Paperclip, Image as ImageIcon, FileText, X, UploadCloud, CheckCircle2 } from 'lucide-react';

export interface AttachmentData {
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'doc' | 'file';
  size: string;
}

interface AttachmentUploaderProps {
  attachment: AttachmentData | null;
  onAttachmentChange: (attachment: AttachmentData | null) => void;
  label?: string;
  helperText?: string;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachment,
  onAttachmentChange,
  label = 'Optional Attachment (Document, PDF, Page Notification, Image or File)',
  helperText = 'Optional: You can attach any document (PDF, Word, TXT), image/photo (PNG, JPG), or page format notification. Leave empty if no file is needed.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    let fileType: 'image' | 'pdf' | 'doc' | 'file' = 'file';

    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (
      file.type.includes('word') ||
      file.type.includes('document') ||
      fileName.toLowerCase().endsWith('.doc') ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      fileType = 'doc';
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      onAttachmentChange({
        name: fileName,
        url: url || '#',
        type: fileType,
        size: fileSize,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAttachmentChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-blue-900" />
          <span>{label}</span>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
        </label>
        {attachment && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileSelect}
        className="hidden"
        id="attachment-file-input"
      />

      {!attachment ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-900/50 bg-[#f8fafc] hover:bg-blue-50/20 rounded-xl p-3.5 sm:p-4 text-center cursor-pointer transition-all group"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-950">
                Click to attach document, image, or page notification
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                PDF, Word (.docx), Images (PNG, JPG), or Text files
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 overflow-hidden">
            {attachment.type === 'image' ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : attachment.type === 'pdf' ? (
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {attachment.name}
                </p>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  {attachment.type}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 font-mono">{attachment.size}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready to publish
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-[10.5px] text-slate-500 font-medium">
        {helperText}
      </p>
    </div>
  );
};

