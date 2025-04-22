import React, { useState } from "react";
import { MdAdd,MdDeleteOutline,MdUpdate ,MdClose } from "react-icons/md";
import DateSelector from "../../components/input/DateSelector";
import ImageSelector from "../../components/input/ImageSelector";
import TagInput from "../../components/input/TagInput";
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import uploadImage from "../../utils/uploadImage";
import {toast} from "react-toastify";
const AddEditMemoryVault = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
    const [title, setTitle] = useState(storyInfo?.title || "");
    const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
    const [story, setStory] = useState(storyInfo?.story || "");
    const [visitedLocation, setVisitedLocation] = useState(storyInfo?.visitedLocation || []);
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);


    const [error, setError] = useState("");

    const updateTravelStory = async () => {
      const storyId = storyInfo._id;
      try {
        let imageUrl = storyInfo.imageUrl || ""; // Keep existing if no new image
        
        // Handle image upload if new image was selected
        if (typeof storyImg === "object") {
          if (!storyImg.type?.startsWith("image/")) {
            setError("Please upload a valid image file");
            return;
          }
          
          try {
            const imgUploadRes = await uploadImage(storyImg);
            if (!imgUploadRes.imageUrl) {
              throw new Error("Image upload failed");
            }
            imageUrl = imgUploadRes.imageUrl;
          } catch (uploadError) {
            setError("Failed to upload image. Please try again.");
            return;
          }
        }
    
        const postData = {
          title,
          story,
          imageUrl,
          visitedLocation,
          visitedDate: visitedDate
            ? moment(visitedDate).valueOf()
            : moment().valueOf(),
        };
    
        const response = await axiosInstance.put(`/edit-story/${storyId}`, postData);
        
        if (response.data?.story) {
          toast.success("Memory Updated Successfully!");
          getAllTravelStories();
          onClose();
        }
      } catch (error) {
        handleApiError(error);
      }
    };

    const addNewTravelStory = async () => {
      try {
        // Validate required fields first
        if (!title || !story) {
          setError("Title and story content are required");
          return;
        }
    
        let imageUrl = "";
        
        // Handle image upload if image was provided
        if (storyImg) {
          if (typeof storyImg === "object") {
            if (!storyImg.type?.startsWith("image/")) {
              setError("Please upload a valid image file");
              return;
            }
    
            try {
              const imgUploadRes = await uploadImage(storyImg);
              if (!imgUploadRes.imageUrl) {
                throw new Error("Image upload failed");
              }
              imageUrl = imgUploadRes.imageUrl;
            } catch (uploadError) {
              setError("Failed to upload image. Please try again.");
              return;
            }
          } else {
            // Handle case where storyImg is a string URL (if needed)
            imageUrl = storyImg;
          }
        }
    
        const response = await axiosInstance.post("/add-travel-story", {
          title,
          story,
          imageUrl,
          visitedLocation,
          visitedDate: visitedDate
            ? moment(visitedDate).valueOf()
            : moment().valueOf(),
        });
    
        if (response.data?.story) {
          toast.success("Memory Added Successfully!");
          getAllTravelStories();
          onClose();
        }
      } catch (error) {
        handleApiError(error);
      }
    };
      
    const handleAddOrUpdateClick = () => {
        console.log("Input Data:", { title, storyImg, story, visitedLocation, visitedDate });

        if (!title) {
            setError("Please enter the title");
            return;
        }

        if (!story) {
            setError("Please enter the story");
            return;
        }

        setError("");

        if (type === "edit") {
            updateTravelStory();
        } else {
            addNewTravelStory();
        }
    };

    // Add this helper function
const handleApiError = (error) => {
  if (error.response?.data?.message) {
    setError(error.response.data.message);
  } else {
    setError("An unexpected error occurred. Please try again.");
  }
};

// Updated image deletion handler
const handleDeleteStoryImg = async () => {
  if (!storyInfo?.imageUrl) {
    setStoryImg(null);
    return;
  }

  try {
    await axiosInstance.delete("/delete-image", {
      params: { imageUrl: storyInfo.imageUrl }
    });
    
    const storyId = storyInfo._id;
    const response = await axiosInstance.put(`/edit-story/${storyId}`, {
      title,
      story,
      visitedLocation,
      visitedDate: moment().valueOf(),
      imageUrl: "",
    });

    if (response.data?.story) {
      setStoryImg(null);
      toast.success("Image removed successfully");
    }
  } catch (error) {
    handleApiError(error);
  }
};      
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-medium text-slate-700">
          {type === "add" ? "Add Story" : "Update Story"}
        </h5>

        <div>
            <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
                {type === "add" ? (
                    <button className="btn-small" onClick={handleAddOrUpdateClick}>
                    <MdAdd className="text-lg" /> ADD MEMORY
                    </button>
                ) : (
                    <>
                    <button className="btn-small" onClick={handleAddOrUpdateClick}>
                        <MdUpdate className="text-lg" /> UPDATE MEMORY
                    </button>
                    </>
                )}

                <button className="" onClick={onClose}>
                    <MdClose className="text-xl text-slate-400" />
                </button>
            </div>
            {error && (<p className="text-red-500 text-xs pt-2 text-right">{error}</p>)}
        </div>
       </div>

        
        <div>
            <div className="flex-1 flex flex-col gap-2 pt-4">
                <label className="input-label">TITLE</label>
                <input
                    type="text"
                    className="text-2xl text-slate-950 outline-none"
                    placeholder="A Day at the Great Wall"
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />

            
                <div className="my-3">
                    <DateSelector date={visitedDate} setDate={setVisitedDate} />
                </div>

                <ImageSelector image={storyImg} setImage={setStoryImg} handleDeleteImg={handleDeleteStoryImg}/>

                <div className="flex flex-col gap-2 mt-4">
                    <label className="input-label">MEMORY</label>
                    <textarea
                        type="text"
                        className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
                        placeholder="Your Memory"
                        rows={10}
                        value={story}
                        onChange={({ target }) => setStory(target.value)}
                    />
                </div>

                <div className="pt-3">
                    <label className="input-label">PLACE/EVENT</label>
                    <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
                </div>


                
            </div>
        </div>
    </div>
  );
};

export default AddEditMemoryVault;
