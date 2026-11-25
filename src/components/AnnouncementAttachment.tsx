import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Download, Eye, X, Paperclip, ExternalLink } from 'lucide-react';

interface AnnouncementAttachmentProps {
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf' | 'doc' | 'file';
  attachmentSize?: string;
  compact?: boolean;
}

export const AnnouncementAttachment: React.FC<AnnouncementAttachmentProps> = ({
  attachmentName,
  attachmentUrl,
  attachmentType = 'file',
  attachmentSize,
  compact = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!attachmentName) return null;

  // Compact pill for list views
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
        {attachmentType === 'image' ? (
          <ImageIcon className="w-3 h-3 text-blue-700" />
        ) : (
          <Paperclip className="w-3 h-3 text-blue-700" />
        )}
        <span className="truncate max-w-[120px]">{attachmentName}</span>
      </span>
    );
  }

  const isImage = attachmentType === 'image' || (attachmentUrl && attachmentUrl.startsWith('data:image'));
  const isPdf = attachmentType === 'pdf' || attachmentName.toLowerCase().endsWith('.pdf');
  const isDoc = attachmentType === 'doc' || attachmentName.toLowerCase().match(/\.(doc|docx)$/i);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!attachmentUrl || attachmentUrl === '#') {
      alert(`Downloading official institutional document: ${attachmentName}`);
      return;
    }
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = attachmentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 mb-2">
        <Paperclip className="w-3.5 h-3.5 text-blue-900" />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
          Attached Document / Page Notice
        </span>
      </div>

      {isImage ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 cursor-pointer group shrink-0"
              title="Click to view image"
            >
              <img
                src={attachmentUrl || './campus.jpg'}
                alt={attachmentName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{attachmentName}</p>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                  Image
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {attachmentSize || 'Official Photo / Notice'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Download</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                isPdf
                  ? 'bg-rose-100 text-rose-700'
                  : isDoc
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{attachmentName}</p>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                    isPdf
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                  }`}
                >
                  {isPdf ? 'PDF' : isDoc ? 'DOCX' : 'DOCUMENT'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {attachmentSize || 'Official File Document'} · Verified Campus Notice
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Download Document</span>
          </button>
        </div>
      )}

      {/* Full-Screen Image Lightbox Modal */}
      {isPreviewOpen && (
        <div
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold truncate">{attachmentName}</span>
                {attachmentSize && (
                  <span className="text-[10px] text-slate-400 font-mono">({attachmentSize})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto max-h-[calc(90vh-60px)] flex items-center justify-center bg-slate-950">
              <img
                src={attachmentUrl || './campus.jpg'}
                alt={attachmentName}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

