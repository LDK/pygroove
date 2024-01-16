import { AxiosResponse } from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getActiveSong, Song, setSongId } from "../redux/songSlice";
import { getActiveUser, setUserSongs } from "../redux/userSlice";
import useApi from "./useApi";

const useSong = () => {
  const user = useSelector(getActiveUser);
  const activeSong = useSelector(getActiveSong);
  const { apiCall, apiGet } = useApi();
  const dispatch = useDispatch();

  const getUserSongs = async () => {
    await apiGet({
      uri: '/user/songs',
      onSuccess: (res) => {
        console.log('User songs:', res.data);
        dispatch(setUserSongs(res.data));
      },
      onError: (err) => {
        console.error('Error getting user data:', err);
      }
    });
  };

  const handleSave = async () => {
    if (!user?.token || !activeSong) {
      return;
    }

    const allPatterns = activeSong.patterns;

    const patterns = allPatterns.filter((pattern) => {
      return Boolean(pattern.steps.length) || Boolean(pattern.name !== `Pattern ${pattern.position}`);
    });

    const {activePattern, loading, error, ...songData } = { ...activeSong, patterns };

    await apiCall({
      uri: `/song/${songData.id ? songData.id + '/' : ''}`,
      method: songData.id ? 'put' : 'post',
      payload: {...songData} as Song,
      onSuccess: (res:AxiosResponse) => {
        if (res.data?.id) {
          dispatch(setSongId(res.data.id));
        }
      },
      onError: (error:any) => {
        console.error('Error during save:', error);
      },
    });
  };

  const handleDuplicate = async (title:string) => {
    if (!user?.token) {
      return;
    }

    const allPatterns = activeSong.patterns;

    const patterns = allPatterns.filter((pattern) => {
      return Boolean(pattern.steps.length) || Boolean(pattern.name !== `Pattern ${pattern.position}`);
    });

    const {activePattern, loading, error, id, ...songData } = { ...activeSong, patterns, title };

    await apiCall({
      uri: `/song/`,
      method: 'post',
      payload: {...songData} as Song,
      onSuccess: (res:AxiosResponse) => {
        // if (res.data?.id) {
        //   dispatch(setActiveSong(res.data));
        // }
        console.log('duplicate response', res.data);
        getUserSongs();
      },
      onError: (error:any) => {
        console.error('Error during save:', error);
      },
    });
  };

  return { handleSave, handleDuplicate, getUserSongs };
};

export default useSong;