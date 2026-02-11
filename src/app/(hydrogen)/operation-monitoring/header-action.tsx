'use client';

import { useState } from 'react';
import { Select } from 'rizzui';

const options = [
    { label: 'Ocean Guardian', value: 'ocean-guardian' },
    { label: 'Maersk', value: 'maersk' },
    { label: 'MSC', value: 'msc' },
];

export default function OperationPageHeaderAction() {
    const [vessel, setVessel] = useState(options[0]);
    return (
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
            <Select
                options={options}
                value={vessel}
                onChange={(value: typeof options[0]) => setVessel(value)}
                placeholder="Select Vessel"
                className="w-full @lg:w-48"
                dropdownClassName="!z-10"
            />
        </div>
    );
}
