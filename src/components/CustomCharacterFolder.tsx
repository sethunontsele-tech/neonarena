import React, { useState, useRef } from 'react';
import { useGameStore } from '../store';
import { 
  Folder, 
  FolderOpen, 
  UploadCloud, 
  Trash2, 
  FileCode, 
  Info, 
  Sparkles, 
  Check, 
  Plus, 
  User 
} from 'lucide-react';

export function CustomCharacterFolder() {
  const { 
    customSkins, 
    addCustomSkin, 
    removeCustomSkin, 
    selectedSkin, 
    setSkin 
  } = useGameStore();

  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Separate files by extensions
    const objFiles = fileList.filter(f => f.name.toLowerCase().endsWith('.obj'));
    const mtlFiles = fileList.filter(f => f.name.toLowerCase().endsWith('.mtl'));
    const gltfFiles = fileList.filter(f => f.name.toLowerCase().endsWith('.gltf') || f.name.toLowerCase().endsWith('.glb'));
    const blendFiles = fileList.filter(f => f.name.toLowerCase().endsWith('.blend'));

    let addedCount = 0;

    // 1. Process GLTF / GLB files
    gltfFiles.forEach(file => {
      const id = 'custom_' + file.name.replace(/\.[^/.]+$/, "") + '_' + Math.floor(Math.random() * 100000);
      const dataUrl = URL.createObjectURL(file);
      addCustomSkin({
        id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileType: file.name.toLowerCase().endsWith('.glb') ? 'glb' : 'gltf',
        dataUrl
      });
      addedCount++;
    });

    // 2. Process OBJ & MTL files
    objFiles.forEach(file => {
      const id = 'custom_' + file.name.replace(/\.[^/.]+$/, "") + '_' + Math.floor(Math.random() * 100000);
      const dataUrl = URL.createObjectURL(file);
      
      // Look for a corresponding MTL file (match by name prefix or take the first mtl)
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const matchedMtl = mtlFiles.find(m => m.name.replace(/\.[^/.]+$/, "") === baseName) || mtlFiles[0];
      
      const mtlUrl = matchedMtl ? URL.createObjectURL(matchedMtl) : undefined;

      addCustomSkin({
        id,
        name: baseName,
        fileType: 'obj',
        dataUrl,
        mtlUrl
      });
      addedCount++;
    });

    // 3. Process BLEND files
    blendFiles.forEach(file => {
      const id = 'custom_' + file.name.replace(/\.[^/.]+$/, "") + '_' + Math.floor(Math.random() * 100000);
      // No standard JS loader for blend, we use our stunning BlenderMechMesh fallback!
      addCustomSkin({
        id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileType: 'blend',
        dataUrl: ''
      });
      addedCount++;
    });

    const totalFiles = fileList.length;
    const unrecognizedFiles = totalFiles - (objFiles.length + mtlFiles.length + gltfFiles.length + blendFiles.length);

    if (addedCount > 0) {
      setSuccessMsg(`Successfully imported ${addedCount} character skin(s)!`);
      // Select the last added skin automatically
      const lastAddedId = customSkins[customSkins.length - 1]?.id;
      // Wait a tiny bit for state sync
      setTimeout(() => {
        const latestSkins = useGameStore.getState().customSkins;
        const newlyAdded = latestSkins[latestSkins.length - 1];
        if (newlyAdded) {
          setSkin(newlyAdded.id);
        }
      }, 50);
    }

    if (unrecognizedFiles > 0) {
      setErrorMsg(`Ignored ${unrecognizedFiles} file(s). Support: .blend, .obj, .mtl, .gltf, .glb`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const skinToRemove = customSkins.find(s => s.id === id);
    if (skinToRemove) {
      if (skinToRemove.dataUrl) URL.revokeObjectURL(skinToRemove.dataUrl);
      if (skinToRemove.mtlUrl) URL.revokeObjectURL(skinToRemove.mtlUrl);
    }
    removeCustomSkin(id);
  };

  return (
    <div className="bg-black/35 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {customSkins.length > 0 ? (
            <FolderOpen className="w-5 h-5 text-amber-400" />
          ) : (
            <Folder className="w-5 h-5 text-amber-500/80" />
          )}
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            📂 Character Folder
          </span>
        </div>
        <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-bold">
          {customSkins.length} MODELS
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-amber-400 bg-amber-500/10' 
            : 'border-white/10 hover:border-amber-500/30 hover:bg-white/5'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept=".blend,.obj,.mtl,.gltf,.glb"
          className="hidden" 
        />
        <UploadCloud className={`w-8 h-8 mb-2 transition-transform duration-200 ${isDragging ? 'scale-110 text-amber-400' : 'text-white/40'}`} />
        <p className="text-[10px] font-bold text-white/80">
          Drag & Drop 3D models here
        </p>
        <p className="text-[8px] text-white/40 mt-1 uppercase tracking-wider">
          Supports .blend, .obj + .mtl, .gltf, .glb
        </p>
      </div>

      {/* Message Toasts */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold py-1 px-2 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[9px] font-bold py-1 px-2 rounded flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Custom Skins List */}
      {customSkins.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {customSkins.map(skin => {
            const isSelected = selectedSkin === skin.id;
            let badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            if (skin.fileType === 'blend') {
              badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            } else if (skin.fileType === 'obj') {
              badgeColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            }

            return (
              <div
                key={skin.id}
                onClick={() => setSkin(skin.id)}
                className={`relative group border rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-400/10' 
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0`}>
                  {skin.fileType === 'blend' ? (
                    <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                  ) : (
                    <User className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-white/60'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase text-white truncate pr-4">
                    {skin.name}
                  </p>
                  <span className={`inline-block text-[7px] font-black px-1.5 py-0.5 rounded-full border ${badgeColor} uppercase`}>
                    .{skin.fileType}
                  </span>
                </div>

                {/* Selected Check */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black rounded-full p-0.5">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </div>
                )}

                {/* Trash Button */}
                <button
                  onClick={(e) => handleRemove(skin.id, e)}
                  className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-all"
                  title="Remove custom character"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-white/5 rounded-lg p-3 text-center">
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
            No Custom Characters Loaded
          </p>
        </div>
      )}

      {/* Info Notice */}
      <div className="flex gap-2 bg-white/5 border border-white/10 p-2 rounded-lg text-[9px] text-white/60 leading-normal">
        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          Dragging a <span className="text-orange-400 font-bold">.blend</span> file automatically initializes a high-fidelity Holographic Mech. Drop <span className="text-amber-400 font-bold">.obj + .mtl</span> or <span className="text-blue-400 font-bold">.glb</span> to view custom textured geometries!
        </p>
      </div>
    </div>
  );
}
