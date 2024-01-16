import { Dialog, DialogTitle, DialogContent, Box, Typography } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Song } from "../redux/songSlice";
import { getActiveUser } from "../redux/userSlice";
import useDialogUI from "../theme/useDialogUI";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { isFunction } from "@mui/x-data-grid/internals";
import { LaunchButton, EditButton, DeleteButton, DuplicateButton } from "./ItemActionButtons";
import SongsTable from "./SongsTable";
import RenameSongDialog from "../dialogs/RenameSongDialog";
import DeleteSongDialog from "../dialogs/DeleteSongDialog";
import LaunchSongDialog from "../dialogs/LaunchSongDialog";
import DuplicateSongDialog from "../dialogs/DuplicateSongDialog";

type ActionFieldsProps = {
  actions: string[];
  handleLaunch?: (id: number) => void;
  handleRename?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleDuplicate?: (id: number) => void;
}

const actionField = (params:ActionFieldsProps) => {
  const { actions, handleLaunch, handleRename, handleDelete, handleDuplicate } = params;
  return {
    field: 'actions',
    headerName: 'Actions',
    width: 250,
    sortable: false,
    valueGetter: (params:GridRenderCellParams) => params.id,
    renderCell: (params:GridRenderCellParams) => (
      <Box display="flex" justifyContent="space-between">
        {(actions.includes('launch') && isFunction(handleLaunch)) && <LaunchButton action={(e) =>{ e.stopPropagation(); handleLaunch(params.value) }} />}
        {(actions.includes('rename') && isFunction(handleRename)) && <EditButton action={(e) =>{ e.stopPropagation(); handleRename(params.value)}} />}
        {(actions.includes('delete') && isFunction(handleDelete)) && <DeleteButton action={(e) =>{ e.stopPropagation(); handleDelete(params.value)}} />}
        {(actions.includes('duplicate') && isFunction(handleDuplicate)) && <DuplicateButton action={(e) =>{ e.stopPropagation(); handleDuplicate(params.value)}} />}
      </Box>
    )
  };

}

const formatDateString = (dateString: string):string => {
  if (!dateString) return ('');
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: 'numeric', minute: '2-digit', hour12: true 
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
}

const SongManagement = ({ open, onClose }:{ open: boolean, onClose: () => void }) => {
  const user = useSelector(getActiveUser);
  const { songs } = user;
  const { DialogActionButtons } = useDialogUI();

  const [duplicateOpen, setDuplicateOpen] = useState<Song | false>(false);
  const [launchOpen, setLaunchOpen] = useState<Song | false>(false);
  const [renameOpen, setRenameOpen] = useState<Song | false>(false);
  const [deleteOpen, setDeleteOpen] = useState<Song | false>(false);

  const handleRename = (id: number) => {
    const song = songs.find((song) => song.id === id);
    setRenameOpen(song || false);
  };

  const handleLaunch = (id: number) => {
    const song = songs.find((song) => song.id === id);
    setLaunchOpen(song || false);
  }

  const handleDelete = (id: number) => {
    const song = songs.find((song) => song.id === id);
    setDeleteOpen(song || false);
  };

  const handleDuplicate = (id: number) => {
    const song = songs.find((song) => song.id === id);
    setDuplicateOpen(song || false);
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth={'xl'}>
      <DialogTitle>Manage Songs</DialogTitle>
      <DialogContent sx={{ mb: 4}}>
        <SongsTable
          label=""
          id="songs-table"
          songList={songs}
          columns={[
            { 
              field: 'title', headerName: 'Title', width: 200,
              renderCell: (params) => (
                <Typography fontWeight={700}>
                  {params.value}
                </Typography>
              ) 
            },
            { field: 'bpm', headerName: 'BPM', width: 100,
              renderCell: (params) => (
                <Typography fontWeight={700}>
                  {params.value}
                </Typography>
              ) 
            },
            { field: 'patterns', headerName: '# Patterns', width: 100,
              renderCell: (params) => (
                <Typography fontWeight={700}>
                  {params.value}
                </Typography>
              ) 
            },
            { field: 'lastEdited', headerName: 'Last Edited', width: 350,
              renderCell: (params) => (
                <Typography fontWeight={700}>
                  {formatDateString(params.value as string).replace(',',' at')}<br />
                </Typography>
              ) 
            },
            actionField({ actions: ['launch', 'rename', 'delete', 'duplicate'], handleLaunch, handleRename, handleDelete, handleDuplicate })
          ]}
        />

        <DialogActionButtons
          hideCancel
          internal
          padding
          confirmLabel="OK"
          onCancel={() => {}}
          onConfirm={() => { onClose(); }}
        />
      </DialogContent>

      <RenameSongDialog
        open={Boolean(renameOpen)}
        song={renameOpen || undefined}
        onClose={() => { setRenameOpen(false); }}
        // callback={(() => { getSongListings(true) })}
      />

      <DeleteSongDialog
        open={Boolean(deleteOpen)}
        song={deleteOpen || undefined}
        onClose={() => { setDeleteOpen(false); }}
        // callback={(() => { getSongListings(true) })}
      />

      <LaunchSongDialog
        open={Boolean(launchOpen)}
        song={launchOpen || undefined}
        onClose={() => { console.log('close launch window'); setLaunchOpen(false); onClose(); }}
        // callback={(() => { getSongListings(true) })}
      />

      <DuplicateSongDialog
        open={Boolean(duplicateOpen)}
        song={duplicateOpen || undefined}
        onClose={() => { setDuplicateOpen(false); }}
        // callback={(() => { getSongListings(true) })}
      />
    </Dialog>
  );
}

export default SongManagement;