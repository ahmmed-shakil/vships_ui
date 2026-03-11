import { 
  PiEngine, 
  PiBellSimpleRingingFill, 
  PiWarningFill, 
  PiCheckCircleFill, 
  PiInfoFill, 
  PiAnchorFill,
  PiLightningFill,
  PiWaveformFill
} from 'react-icons/pi';

export const notificationsData = [
  {
    id: 1,
    name: 'High exhaust gas temperature on Ocean Voyager - ME PORT',
    icon: PiWarningFill,
    unRead: true,
    sendTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: 2,
    name: 'Critical Alert: Low lube oil pressure on Sea Explorer - AE1',
    icon: PiBellSimpleRingingFill,
    unRead: true,
    sendTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 3,
    name: 'Maintenance completed for ME STBD on Atlantic Star',
    icon: PiCheckCircleFill,
    unRead: false,
    sendTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 4,
    name: 'Vessel Ocean Voyager entered Singapore Port area',
    icon: PiAnchorFill,
    unRead: false,
    sendTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 5,
    name: 'ME CENTER fuel consumption efficiency improved by 5%',
    icon: PiLightningFill,
    unRead: true,
    sendTime: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
  },
  {
    id: 6,
    name: 'New engine vibration report available for Arctic Sun',
    icon: PiWaveformFill,
    unRead: true,
    sendTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 7,
    name: 'System Update: Windy map weather layers now active',
    icon: PiInfoFill,
    unRead: false,
    sendTime: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
  },
  {
    id: 8,
    name: 'Scheduled maintenance for ME STBD on Ocean Voyager starting in 2 days',
    icon: PiEngine,
    unRead: false,
    sendTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

