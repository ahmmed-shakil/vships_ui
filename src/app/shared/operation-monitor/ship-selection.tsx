'use client';

import { useState } from 'react';
import { Select } from 'rizzui';

const options = [
    { label: 'Ocean Guardian', value: 'ocean-guardian' },
    { label: 'Maersk', value: 'maersk' },
    { label: 'MSC', value: 'msc' },
];

export default function OperationMonitorShipSelection() {
    const [vessel, setVessel] = useState(options[0]);
    return (
        <div className="mb-4 w-64 flex items-center gap-3 @lg:mb-0 @lg:w-fit">
            <Select
                options={options}
                value={vessel}
                onChange={(value: typeof options[0]) => setVessel(value)}
                placeholder="Select Vessel"
                className="w-full @lg:w-64"
                dropdownClassName="!z-10"
            />
        </div>
    );
}
