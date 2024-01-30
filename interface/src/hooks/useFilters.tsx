import { Box, Checkbox, Grid, Select, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Track } from "../redux/songSlice";
import Knob from "../components/Knob";
import Range from "../components/Range";

interface useFiltersProps {
  track?: Track;
  changeCallback?: (filters: any) => void;
}

const useFilters = ({ track, changeCallback }: useFiltersProps) => {
  // Filter controls
  const [filter1On, setFilter1On] = useState(track?.filters?.length ? track.filters[0].on : false);
  const [filter1Type, setFilter1Type] = useState(track?.filters?.length ? track.filters[0].filter_type : 'lp');
  const [filter1Order, setFilter1Order] = useState<number>(track?.filters?.length ? (track.filters[0].order || 1) : 1);
  const [filter1Freq, setFilter1Freq] = useState<number>(track?.filters?.length ? track.filters[0].frequency : 0);

  const [filter2On, setFilter2On] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].on : false);
  const [filter2Type, setFilter2Type] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].filter_type : 'lp');
  const [filter2Order, setFilter2Order] = useState((track?.filters?.length && track.filters.length > 1) ? (track.filters[1].order || 1) : 1);
  const [filter2Freq, setFilter2Freq] = useState((track?.filters?.length && track.filters.length > 1) ? track.filters[1].frequency : 0);

  useEffect(() => {
    if (!filter1Order) {
      setFilter1Order(1);
    }
    if (!filter2Order) {
      setFilter2Order(1);
    }
  }, [filter1Order, filter2Order]);
  
  useEffect(() => {
    if (changeCallback) {
      changeCallback({
        filter1On, filter1Type, filter1Order, filter1Freq,
        filter2On, filter2Type, filter2Order, filter2Freq,
      });
    }
  }, [filter1On, filter1Type, filter1Order, filter1Freq,
    filter2On, filter2Type, filter2Order, filter2Freq]);

  const TrackFilters = () => { 
    const [changed, setChanged] = useState(false);

    useEffect(() => {
      if (changed) {
        if (changeCallback) {
          changeCallback({
            filter1On, filter1Type, filter1Order, filter1Freq,
            filter2On, filter2Type, filter2Order, filter2Freq,
          });
        }
  
        setChanged(false);
      }
    }, [changed]);

    return (
    <Grid container spacing={0} sx={{ height: '314px' }}>
      {[1, 2].map((filterIdx) => (
        <Grid key={`filter-${filterIdx}`} item xs={12} p={0} m={0} mb={1}>
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
              setChanged(true);
            }} />
            <Typography variant="subtitle1" component="span">
              Filter {filterIdx}
            </Typography>

            <Grid container spacing={0} my={1}>
              <Grid item xs={4} pt={0}>
                <Typography variant="caption" component="p" mt={0} mb={2}>
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

                    setChanged(true);
                  } }
                  inputProps={{
                    name: 'filterType',
                    id: 'filterType',
                  }}
                >
                  {['lp', 'hp'/*, 'bp'*/].map((type) => {
                    return (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    );
                  })}
                </Select>
              </Grid>

              <Grid item xs={4} sx={{ pr: 2 }}>
                <Typography variant="caption" component="p" mt={0} mb={2}>
                  Cutoff Freq.
                </Typography>

                <Range min={1} max={22000} step={1} defaultValue={filterIdx === 1 ? filter1Freq : filter2Freq} onChange={(e:ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value);

                  if (filterIdx === 1) {
                    setFilter1Freq(val);
                  } else {
                    setFilter2Freq(val);
                  }

                  setChanged(true);

                }} />

                <Typography variant="caption">
                  {Math.round((filterIdx === 1 ? filter1Freq : filter2Freq))} Hz
                </Typography>
              </Grid>

              <Grid item xs={4} sx={{ pr: 2 }}>
                <Typography variant="caption" component="p" mt={0} mb={2}>
                  Order
                </Typography>

                <Range min={1} max={6} step={1} defaultValue={filterIdx === 1 ? filter1Order : filter2Order} onChange={(e:ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value);

                  if (filterIdx === 1) {
                    setFilter1Order(val);
                  } else {
                    setFilter2Order(val);
                  }

                  setChanged(true);

                }} />

                <Typography variant="caption">
                  {Math.round((filterIdx === 1 ? filter1Order : filter2Order))}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      ))}
    </Grid>
  );}

  return {
    TrackFilters,
    filter1On, setFilter1On,
    filter1Type, setFilter1Type,
    filter1Order, setFilter1Order,
    filter1Freq, setFilter1Freq,
    filter2On, setFilter2On,
    filter2Type, setFilter2Type,
    filter2Order, setFilter2Order,
    filter2Freq, setFilter2Freq,
  };
}

export default useFilters;