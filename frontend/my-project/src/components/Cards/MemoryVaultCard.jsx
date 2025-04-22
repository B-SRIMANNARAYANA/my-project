import React from "react";
import { FaHeart , FaRegHeart } from "react-icons/fa";
import { GrMapLocation } from "react-icons/gr";
import moment from "moment"; 

const MemoryVaultCard = ({
  imgUrl,
  title,
  date,
  story,
  visitedLocation,
  onFavouriteClick,
  isFavourite,
  onClick,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg hover:shadow-slate-200 transition-all ease-in-out relative cursor-pointer">
      <img
        src={imgUrl}
        alt={title}
        className="w-full h-56 object-cover rounded-lg"
        onClick={onClick}
      />

      <button 
        onClick={onFavouriteClick}
        className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full"
        aria-label={isFavourite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavourite ? (
          <FaHeart className="text-red-500 text-xl" />
        ) : (
          <FaRegHeart className="text-gray-400 text-xl hover:text-red-500" />
        )}
      </button>


      <div className="p-4" onClick={onClick}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h6 className="text-sm font-medium">{title}</h6>
            <span className="text-xs text-slate-500">
              {date ? moment(date).format("Do MMM YYYY") : "-"}
            </span>
          </div>
        </div>

        <p className="text-x5 text-slate-600 mt-2">{story?.slice(0,60)}</p>

        <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded mt-3 px-2 py-1">
            <GrMapLocation className="text-sm" />
            {visitedLocation.map((item, index)=>
            visitedLocation.length==index + 1? `${item}` :`${item},`
            )}
        </div>
      </div>
    </div>
  );
};

export default MemoryVaultCard;
