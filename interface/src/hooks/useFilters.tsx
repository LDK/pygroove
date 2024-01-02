import { Box, Checkbox, Grid, Select, Typography } from "@mui/material";
import { useState } from "react";
import { Track } from "../redux/songSlice";
import Knob from "../components/Knob";

interface useFiltersProps {
  track?: Track;
}

const useFilters = ({ track }: useFiltersProps) => {
  // Filter controls
  const [filter1On, setFilter1On] = useState(track?.filters?.length ? track.filters[0].on : false);
  const [filter1Type, setFilter1Type] = useState(track?.filters?.length ? track.filters[0].filter_type : 'lp');
  const [filter1Q, setFilter1Q] = useState(track?.filters?.length ? track.filters[0].q : 0);
  const [filter1Freq, setFilter1Freq] = useState<number>(track?.filters?.length ? track.filters[0].frequency : 1);

  const [filter2On, setFilter2On] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].on : false);
  const [filter2Type, setFilter2Type] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].filter_type : 'lp');
  const [filter2Q, setFilter2Q] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].q : 0);
  const [filter2Freq, setFilter2Freq] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].frequency : 1);

  const TrackFilters = () => (
    <Grid container spacing={0}>
      {[1, 2].map((filterIdx) => (
        <Grid key={`filter-${filterIdx}`} item xs={12} p={0} m={0} mb={2}>
          <Box borderRadius={1} borderColor="primary.dark" p={1} m={0} sx={{
            borderStyle: 'solid',
            borderWidth: '1px',
          }}>
            <Checkbox sx={{ py: 0, display: 'inline-block' }} defaultChecked={filterIdx === 1 ? filter1On : filter2On} onChange={() => {
              if (filterIdx === 1) {
                setFilter1On(!filter1On);
              } else {
                setFilter2On(!filter2On);
              }
            }} />
            <Typography variant="subtitle1" component="span">
              Filter {filterIdx}
            </Typography>

            <Grid container spacing={0} my={2}>
              <Grid item xs={4} pt={0}>
                <Typography variant="caption" component="p" mt={0}>
                  Filter Type
                </Typography>

                <Select
                  native
                  value={filterIdx === 1 ? filter1Type : filter2Type}
                  onChange={(e) => {
                    if (filterIdx === 1) {
                      setFilter1Type(e.target.value);
                    } else {
                      setFilter2Type(e.target.value);
                    }
                  } }
                  inputProps={{
                    name: 'filterType',
                    id: 'filterType',
                  }}
                >
                  {['lp', 'hp', 'bp'].map((type) => {
                    return (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    );
                  })}
                </Select>
              </Grid>

              <Grid item xs={4}>
                <Knob initValue={filterIdx === 1 ? filter1Freq : filter2Freq} onBlur={(val:number) => {
                  if (filterIdx === 1) {
                    setFilter1Freq(val);
                  } else {
                    setFilter2Freq(val);
                  }
                }} />
              </Grid>

              <Grid item xs={4}>
                <Knob initValue={filterIdx === 1 ? filter1Q : filter2Q} onBlur={(val:number) => {
                  if (filterIdx === 1) {
                    setFilter1Q(val);
                  } else {
                    setFilter2Q(val);
                  }
                }} />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return {
    TrackFilters,
    filter1On, setFilter1On,
    filter1Type, setFilter1Type,
    filter1Q, setFilter1Q,
    filter1Freq, setFilter1Freq,
    filter2On, setFilter2On,
    filter2Type, setFilter2Type,
    filter2Q, setFilter2Q,
    filter2Freq, setFilter2Freq,
  };
}

export default useFilters;