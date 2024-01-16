import { Box, Typography, Grid } from "@mui/material";
import { GridColDef, GridSortModel, DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { Song } from "../redux/songSlice";

export type SongsTableProps = {
  columns: GridColDef[];
  initSort?: GridSortModel;
  label: string;
  songList: Song[];
  id: string;
  emptyText?: string;
}

const SongsTable = ({ columns, initSort, label, songList, id, emptyText }:SongsTableProps) => {
  const [sort, setSort] = useState<GridSortModel | undefined>(initSort || undefined);

  if (!songList || songList.length === 0) {
    return (
      <Box id={id}>
        <Typography>{emptyText || 'No songs found.'}</Typography>
      </Box>
    );
  }

  const dataGrid= (
    <DataGrid
      onSortModelChange={(model) => {
        setSort(model);
      }}
        sx={{
          "& .MuiDataGrid-columnHeaderTitle": {
            whiteSpace: "normal",
            lineHeight: "normal"
          },
          "& .MuiDataGrid-columnHeader": {
            // Forced to use important since overriding inline styles
            height: "unset !important"
          },
          "& .MuiDataGrid-columnHeaders": {
            // Forced to use important since overriding inline styles
            maxHeight: "168px !important"
          }
        }}
      columns={columns}
      
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
        sorting: {
          sortModel: sort
        },
      }}
      pageSizeOptions={[5, 10, 25, 50]}
      rows={songList.map((song) => ({ id: song.id, title: song.title, bpm: song.bpm, patterns: song.patterns.length, lastEdited: song.lastEdited }))}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd'
      }
    />
  );

  return (
    <Box id={id}>
      <Typography mb={1}>{label}</Typography>
      <Grid container maxWidth="xl" spacing={2}>
        <Grid item xs={12} key={`song-manager-${id}`}>
          {dataGrid}
        </Grid>
      </Grid>
    </Box>
  );
}


export default SongsTable;