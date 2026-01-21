import React from 'react';
import { Box } from 'rizzui/box';
import ProjectStats from '../project-dashboard/project-stats';
import OverallProgress from '../project-dashboard/overall-progress';
import CustomMap from '@/app/(hydrogen)/widgets/maps/custom-map';
import MixBarChart from '../chart-widgets/mix-bar-chart';
import CustomizedMixChart from '../chart-widgets/customized-mix-chart';

const OperationMonitorLayout = () => {
  return (
    <Box className="@container/pd">
      {/* Row 1 */}
      <Box className="grid grid-cols-10 gap-6 @container/pd 3xl:gap-8">
        {/* Left column - 70% (7 of 10 columns) */}
        <Box className="col-span-10 lg:col-span-7">
          <Box className="grid grid-cols-3 gap-6 3xl:gap-8">
            {/* First of 3 equal columns */}
            <Box className="col-span-3 sm:col-span-1">
              <OverallProgress className="@3xl/pd:col-span-6 @7xl/pd:col-span-4" />
            </Box>
            {/* Second of 3 equal columns */}

            <Box className="col-span-3 sm:col-span-1">
              {/* Add content here */}
              <OverallProgress className="@3xl/pd:col-span-6 @7xl/pd:col-span-4" />
            </Box>
            {/* Third of 3 equal columns */}
            <Box className="col-span-3 sm:col-span-1">
              {/* Add content here */}
              <OverallProgress className="@3xl/pd:col-span-6 @7xl/pd:col-span-4" />
            </Box>
          </Box>
        </Box>

        {/* Right column - 30% (3 of 10 columns) */}
        <Box className="col-span-10 lg:col-span-3">
          <CustomMap />
        </Box>
      </Box>
      {/* Row 2 */}
      <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
        <MixBarChart />
      </Box>
      {/* Row 3 */}
      <Box className="mt-6 grid grid-cols-1 gap-6 @container/pd lg:mt-8 3xl:gap-8">
        <CustomizedMixChart />
      </Box>
    </Box>
  );
};

export default OperationMonitorLayout;
