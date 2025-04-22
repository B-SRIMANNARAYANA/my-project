import React from "react";
import { MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md";
import moment from "moment";
import { GrMapLocation } from "react-icons/gr";

const ViewMemoryVault = ({ 
  storyInfo = null, 
  onClose, 
  onEditClick, 
  onDeleteClick 
}) => {
  // Safeguard against null/undefined storyInfo
  if (!storyInfo) {
    return (
      <div className="relative p-4 bg-white rounded-lg">
        <div className="flex justify-end">
          <button onClick={onClose}>
            <MdClose className="text-xl text-slate-400" />
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-500">No Memory Available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
          <button className="btn-small" onClick={onEditClick}>
            <MdUpdate className="text-lg" /> UPDATE MEMORY
          </button>
          <button className="btn-small btn-delete" onClick={onDeleteClick}>
            <MdDeleteOutline className="text-lg" /> DELETE
          </button>
          <button onClick={onClose}>
            <MdClose className="text-xl text-slate-400" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex-1 flex flex-col gap-2 py-4">
          <h1 className="text-2xl text-slate-950">
            {storyInfo.title || "Untitled Story"}
          </h1>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {storyInfo.visitedDate 
                ? moment(storyInfo.visitedDate).format("Do MMM YYYY") 
                : "No date specified"}
            </span>

            <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded px-2 py-1">
              <GrMapLocation className="text-sm" />
              {storyInfo.visitedLocation?.length > 0 
                ? storyInfo.visitedLocation.join(", ")
                : "No locations specified"}
            </div>
          </div>
        </div>

        {storyInfo.imageUrl && (
          <img
            src={storyInfo.imageUrl}
            alt="Memory"
            className="w-full h-[300px] object-cover rounded-lg"
          />
        )}

        <div className="mt-4">
          <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">
            {storyInfo.story || "No story content available"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewMemoryVault;