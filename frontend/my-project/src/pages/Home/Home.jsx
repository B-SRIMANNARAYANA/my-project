import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import {MdAdd} from "react-icons/md"
import Modal from 'react-modal'
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import MemoryVaultCard from "../../components/Cards/MemoryVaultCard";
import AddEditMemoryVault from "./AddEditMemoryVault";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ViewMemoryVault from "./ViewMemoryVault";
import { DayPicker } from "react-day-picker";
import EmptyCard from "../../components/Cards/EmptyCard";
import FilterInfoTitle from "../../components/Cards/FilterInfoTitle";
import {getEmptyCardMessage} from "../../utils/helper"
const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [dateRange, setDateRange] = useState({from:null,to:null})

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });
  

  //  Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) { 
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  //  Get all travel stories
const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

//handle edit stroy click
const handleEdit = (data) => {
  setOpenAddEditModal({ 
    isShown: true, 
    type: "edit", 
    data: data 
  });
};

//handle tarvel story click
const handleViewStory=(data)=>{
  setOpenViewModal({isShown:true,data});
};

//handle update favourite
const updateIsFavourite = async (storyData) => {
  try {
    const response = await axiosInstance.put(
      `/update-is-favourite/${storyData._id}`,
      { isFavourite: !storyData.isFavourite }
    );

    if (response.data?.story) {
      toast.success(
        response.data.story.isFavourite 
          ? "Added to favorites!" 
          : "Removed from favorites!"
      );
      
      // Update local state without refetching
      setAllStories(prevStories => 
        prevStories.map(story => 
          story._id === response.data.story._id 
            ? response.data.story 
            : story
        ).sort((a, b) => {
          // Favorites first, then by date
          if (a.isFavourite === b.isFavourite) {
            return new Date(b.visitedDate) - new Date(a.visitedDate);
          }
          return a.isFavourite ? -1 : 1;
        })
      );
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update favorite status");
  }
};

// Delete Story
const deleteTravelStory = async (data) => {
  const storyId = data._id;

  try {
    const response = await axiosInstance.delete(`/delete-story/${storyId}`);

    if (response.data && !response.data.error) {
      toast.success("Memory deleted successfully");
      
      // OPTION 1: Optimistic update - remove from local state immediately
      setAllStories(prevStories => 
        prevStories.filter(story => story._id !== storyId)
      );
      
      // OPTION 2: Refetch all stories (slower but more reliable)
      // await getAllTravelStories();
      
      setOpenViewModal({ isShown: false, data: null });
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error(error.response?.data?.message || "Failed to delete memory");
  }
};

const onSearchStory=async(query)=>{
  try {
    const response = await axiosInstance.get("/search" , {
      params:{
        query,
      },
    });

    if (response.data && response.data.stories) {
      setFilterType("search");
      setAllStories(response.data.stories);
    }
  }catch (error) {
    
      console.log("An unexpected error occurred. Please try again.");
  }
}

const handleClearSearch=()=>{
  setFilterType("");
  getAllTravelStories();
}

const filterStoriesByDate = async (day) => {
  try {
    const startDate = day?.from ? moment(day.from).valueOf() : null;
    const endDate = day?.to ? moment(day.to).valueOf() : null;

    if (startDate && endDate) {
      const response = await axiosInstance.get("/travel-stories/filter", {
        params: { startDate, endDate },
      });

      if (response.data && response.data.stories) {
        setFilterType("date");
        setAllStories(response.data.stories);
      }
    }
  } catch (error) {
    console.log("An unexpected error occurred. Please try again.");
  }
};


const handleDayClick=(day)=>{
  setDateRange(day);
  filterStoriesByDate(day);
}

const resetFilter=()=>{
  setDateRange({from:null,to:null});
  setFilterType("");
  getAllTravelStories();
}

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
    return ()=>{};
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory} handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto py-10">

        <FilterInfoTitle 
          filterType={filterType}
          filterDates={dateRange}
          onClear={()=>{
            resetFilter();
          }}
        />


        <div className="flex gap-7">
          <div className="flex-1">
          {allStories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {allStories.map((item) => (
            <MemoryVaultCard 
              key={item._id}
              imgUrl={item.imageUrl}
              title={item.title}
              story={item.story}
              date={item.visitedDate}
              visitedLocation={item.visitedLocation}
              isFavourite={item.isFavourite}
              onClick={() => handleViewStory(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteTravelStory(item)}
              onFavouriteClick={() => updateIsFavourite(item)}
            />
          ))}
          </div>
        ) : (
          <EmptyCard message={getEmptyCardMessage(filterType)}/>
        )}
          </div>
          <div className="w-[350px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add edit modal*/}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box scrollbar"
      >
        <AddEditMemoryVault
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllTravelStories={getAllTravelStories}
        />

      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box scrollbar"
      >
        <ViewMemoryVault
          storyInfo={openViewModal.data || null}
          onClose={()=>{
            setOpenViewModal((prevState)=>({...prevState,isShown:false}));
          }}
          onEditClick={()=>{
            setOpenViewModal((prevState)=>({...prevState,isShown:false}));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={()=>{
            deleteTravelStory(openViewModal.data || null);
          }}
          
        />
      </Modal>


      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-600 fixed right-10 bottom-10 shadow-lg transition-all duration-300"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>


      <ToastContainer />
    </>
  );
};

export default Home;
