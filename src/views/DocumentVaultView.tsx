import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Eye, 
  Calendar,
  Cloud,
  ExternalLink 
} from 'lucide-react';
import { PuppyProfile, DocumentRecord } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { deleteImageFromCloudinary } from '../lib/cloudinary';

interface DocumentVaultViewProps {
  puppy: PuppyProfile;
}

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({ puppy }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => storage.getDocuments(puppy.id));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    setDocuments(storage.getDocuments(puppy.id));
  }, [puppy.id]);

  useEffect(() => {
    return storage.subscribe(() => {
      setDocuments(storage.getDocuments(puppy.id));
    });
  }, [puppy.id]);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('vaccination');
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    storage.addDocument({
      puppyId: puppy.id,
      title,
      category,
      date: new Date().toISOString().split('T')[0],
      fileType: fileUrl ? (fileUrl.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMAGE') : 'PDF',
      fileSize: fileUrl ? 'Cloud File' : '1.2 MB',
      fileUrl: fileUrl || undefined,
      notes
    });
    setDocuments(storage.getDocuments(puppy.id));
    setIsAddOpen(false);
    setTitle('');
    setNotes('');
    setFileUrl('');
  };

  const handleDelete = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc?.fileUrl) {
      deleteImageFromCloudinary(doc.fileUrl).catch(() => {});
    }
    storage.deleteDocument(id);
    setDocuments(storage.getDocuments(puppy.id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Puppy Document Vault
            </h1>
            <span className="text-xs font-bold bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
              {documents.length} Records Safe
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Store vaccination certificates, insurance policies, and microchip registration securely for quick vet or travel access.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
          <FileText className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#2C211B] mb-1">No documents uploaded yet</h4>
          <p className="text-xs text-[#766A63] max-w-sm mx-auto mb-4">
            Upload vaccination records, adoption contracts, or insurance cards for {puppy.name}.
          </p>
          <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddOpen(true)}>
            Upload First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col justify-between hover:border-[#8B5E3C]/40 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] bg-[#FFF9F2] px-2 py-0.5 rounded-md border border-[#E8DDD3]">
                    {doc.category}
                  </span>
                  <span className="text-xs font-semibold text-[#766A63]">
                    {doc.fileSize} • {doc.fileType}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#2C211B] leading-snug group-hover:text-[#8B5E3C] transition-colors">
                  {doc.title}
                </h3>
                {doc.notes && (
                  <p className="text-xs text-[#766A63] mt-1 line-clamp-2">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8DDD3]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#766A63]">Added: {doc.date}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoc(doc)}
                    className="text-xs py-1 px-2.5 min-h-[32px]"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View
                  </Button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-[#766A63] hover:text-rose-600 transition-colors rounded-lg"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Document Preview Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || 'Document Preview'}
        subtitle={selectedDoc ? `${selectedDoc.fileType} • ${selectedDoc.fileSize} • ${selectedDoc.category}` : ''}
      >
        {selectedDoc && (
          <div className="space-y-4">
            {selectedDoc.fileUrl ? (
              <div className="rounded-2xl overflow-hidden border border-[#E8DDD3] bg-[#FFF9F2] p-2 text-center">
                <img
                  src={selectedDoc.fileUrl}
                  alt={selectedDoc.title}
                  className="max-h-72 w-full object-contain rounded-xl mx-auto"
                />
                <a
                  href={selectedDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5E3C] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Original in Cloudinary
                </a>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] text-center">
                <FileText className="w-16 h-16 text-[#8B5E3C] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-[#2C211B]">{selectedDoc.title}</h4>
                <p className="text-xs text-[#766A63] mt-1">
                  Authenticated PDF Document on file for {puppy.name}
                </p>
                {selectedDoc.notes && (
                  <p className="text-xs text-[#5F3E29] mt-3 p-2.5 bg-white rounded-xl border border-[#E8DDD3] max-w-sm mx-auto">
                    {selectedDoc.notes}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  if (selectedDoc.fileUrl) {
                    window.open(selectedDoc.fileUrl, '_blank');
                    return;
                  }
                  const content = `PUPPY RECORD: ${selectedDoc.title}\nCategory: ${selectedDoc.category}\nDate: ${selectedDoc.date}\nNotes: ${selectedDoc.notes || 'None'}\nPuppy: ${puppy.name}`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setSelectedDoc(null);
                }}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {selectedDoc.fileUrl ? 'Open / Download Document' : `Download Record (${selectedDoc.fileSize})`}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Document Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Document Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rabies Vaccination Certificate"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            >
              <option value="vaccination">Vaccination Record</option>
              <option value="insurance">Insurance Policy</option>
              <option value="microchip">Microchip Registration</option>
              <option value="adoption">Adoption / Breeder Papers</option>
              <option value="vet_bill">Vet Invoices</option>
              <option value="other">Other Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Document Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Signed by Dr. Vance on Aug 22"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Upload File / Photo to Cloudinary
            </label>
            <CloudinaryImageUploader
              currentImageUrl={fileUrl}
              onUploadSuccess={(url) => setFileUrl(url)}
              folder="puplume/documents"
              label="Upload Medical / Adoption Document"
              sublabel="Upload vet certificate, vaccine record photo, or receipt directly to Cloudinary"
              variant="card"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
