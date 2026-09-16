import type { SosAlert } from '@/types/alert';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
const minsAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();

export const mockAlerts: SosAlert[] = [
  {
    alert_id: 'SOS-9481',
    severity: 'critical',
    location: 'Samut Prakan, TH',
    timestamp: minsAgo(18),
    cluster_id: 'CL-2847',
    reason: 'FRP spike 324MW near Oil Refinery',
    status: 'active',
    automated_assessment:
      'Refinery proximity alarm triggered. AI indicates a 94% chance of active refinery storage well leakage or industrial structure failure due to sudden high-radiance temperature shift.',
    recommended_actions: [
      'Confirm coordinates with ground sensor validation.',
      'Transmit alert feed direct to Bangkok East safety desk.',
      'Direct satellite thermal scanning passes (high frequency).',
    ],
    assigned_team: 'Regional Ops Command-3',
    assigned_team_status: 'on_call',
    log_timeline: [
      { timestamp: minsAgo(18), message: 'Satellite Sentinel-2 flags thermal spike 324MW' },
      { timestamp: minsAgo(17), message: 'Automated trigger algorithm flags High Risk' },
      { timestamp: minsAgo(15.5), message: 'System routes incident to SOS Queue' },
    ],
  },
  {
    alert_id: 'SOS-9472',
    severity: 'high',
    location: 'Kinshasa, CD',
    timestamp: hoursAgo(2.3),
    cluster_id: 'CL-1049',
    reason: 'Persistent hotspot near dense timberyard',
    status: 'active',
    automated_assessment:
      'Sustained thermal signature over 30 hours near a timber processing facility. Elevated risk of uncontrolled spread into adjacent stockpiles.',
    recommended_actions: [
      'Cross-reference with regional fire service dispatch logs.',
      'Escalate to timberyard facility safety officer.',
      'Schedule follow-up satellite pass within 4 hours.',
    ],
    assigned_team: 'Regional Ops Command-1',
    assigned_team_status: 'dispatched',
    log_timeline: [
      { timestamp: hoursAgo(2.3), message: 'Persistent hotspot confirmed across 3 consecutive passes' },
      { timestamp: hoursAgo(2.1), message: 'Risk engine assigns High severity' },
      { timestamp: hoursAgo(1.9), message: 'Alert routed to Regional Ops Command-1' },
    ],
  },
  {
    alert_id: 'SOS-9460',
    severity: 'critical',
    location: 'Maracaibo, VE',
    timestamp: hoursAgo(0.75),
    cluster_id: 'CL-5049',
    reason: 'Anomalous temperature sweep >410K',
    status: 'acknowledged',
    automated_assessment:
      'Brightness temperature exceeds baseline by a wide margin near a storage terminal. Rapid FRP escalation over the last 3 hours suggests an active, growing fire.',
    recommended_actions: [
      'Request thermal confirmation from nearest ground unit.',
      'Notify Maracaibo terminal operations control room.',
      'Hold elevated satellite revisit cadence for 12 hours.',
    ],
    assigned_team: 'Regional Ops Command-4',
    assigned_team_status: 'dispatched',
    log_timeline: [
      { timestamp: hoursAgo(0.75), message: 'Sentinel-2 detects anomalous >410K sweep' },
      { timestamp: hoursAgo(0.6), message: 'Risk engine assigns Critical severity' },
      { timestamp: hoursAgo(0.4), message: 'Ops team acknowledged incident' },
    ],
  },
  {
    alert_id: 'SOS-9459',
    severity: 'medium',
    location: 'Kalimantan, ID',
    timestamp: hoursAgo(5.1),
    cluster_id: 'CL-8831',
    reason: 'Broad peat thermal pattern detected',
    status: 'resolved',
    automated_assessment:
      'Diffuse thermal signature consistent with seasonal peat burning. Low FRP relative to affected area; monitored, no immediate structural risk identified.',
    recommended_actions: ['Log as seasonal agricultural pattern.', 'Continue routine daily satellite monitoring.'],
    assigned_team: 'Regional Ops Command-2',
    assigned_team_status: 'standby',
    log_timeline: [
      { timestamp: hoursAgo(5.1), message: 'Broad thermal pattern flagged by classifier' },
      { timestamp: hoursAgo(4.5), message: 'Risk engine assigns Medium severity' },
      { timestamp: hoursAgo(2.0), message: 'Incident resolved — consistent with seasonal burn' },
    ],
  },
  {
    alert_id: 'SOS-9452',
    severity: 'high',
    location: 'Queensland, AU',
    timestamp: hoursAgo(1.4),
    cluster_id: 'CL-0812',
    reason: 'Fast moving brush thermal vector match',
    status: 'acknowledged',
    automated_assessment:
      'Vector analysis indicates rapid wind-aligned spread through brush terrain. Trajectory model projects expansion toward populated periphery within 6 hours.',
    recommended_actions: [
      'Notify Queensland Rural Fire Service liaison.',
      'Model spread trajectory against nearest settlements.',
      'Increase satellite revisit frequency to hourly.',
    ],
    assigned_team: 'Regional Ops Command-5',
    assigned_team_status: 'dispatched',
    log_timeline: [
      { timestamp: hoursAgo(1.4), message: 'Fast-moving thermal vector detected' },
      { timestamp: hoursAgo(1.2), message: 'Spread trajectory model engaged' },
      { timestamp: hoursAgo(0.9), message: 'Ops team acknowledged incident' },
    ],
  },
  {
    alert_id: 'SOS-9448',
    severity: 'low',
    location: 'Siberia, RU',
    timestamp: hoursAgo(11),
    cluster_id: 'CL-4412',
    reason: 'Isolated seasonal fire signature',
    status: 'resolved',
    automated_assessment:
      'Small isolated thermal signature consistent with known seasonal fire activity in the region. No adjacent infrastructure within risk radius.',
    recommended_actions: ['Log for seasonal trend dataset.', 'No further action required.'],
    assigned_team: 'Regional Ops Command-1',
    assigned_team_status: 'standby',
    log_timeline: [
      { timestamp: hoursAgo(11), message: 'Isolated signature flagged, Low severity' },
      { timestamp: hoursAgo(9), message: 'Incident closed — no anomaly' },
    ],
  },
  {
    alert_id: 'SOS-9441',
    severity: 'critical',
    location: 'Anzoátegui, VE',
    timestamp: hoursAgo(4.3),
    cluster_id: 'CL-1929',
    reason: 'Offshore platform thermal spike registered',
    status: 'active',
    automated_assessment:
      'FRP magnitude exceeds platform baseline by roughly 6x. Pattern consistent with an uncontrolled flare event or structural failure rather than routine flaring.',
    recommended_actions: [
      'Contact platform operator for flare status confirmation.',
      'Alert regional maritime safety authority.',
      'Maintain continuous satellite coverage over the platform.',
    ],
    assigned_team: 'Regional Ops Command-4',
    assigned_team_status: 'on_call',
    log_timeline: [
      { timestamp: hoursAgo(4.3), message: 'Offshore thermal spike registered' },
      { timestamp: hoursAgo(4.0), message: 'Risk engine assigns Critical severity' },
      { timestamp: hoursAgo(3.6), message: 'Routed to Regional Ops Command-4' },
    ],
  },
  {
    alert_id: 'SOS-9430',
    severity: 'high',
    location: 'Mombasa, KE',
    timestamp: hoursAgo(13.8),
    cluster_id: 'CL-3312',
    reason: 'Industrial yard temperature outlier',
    status: 'resolved',
    automated_assessment:
      'Localized temperature outlier at a scrap and metal processing yard. Investigation confirmed routine cutting-torch activity, not an uncontrolled fire.',
    recommended_actions: ['Log as confirmed routine industrial activity.', 'No further escalation required.'],
    assigned_team: 'Regional Ops Command-2',
    assigned_team_status: 'standby',
    log_timeline: [
      { timestamp: hoursAgo(13.8), message: 'Temperature outlier flagged' },
      { timestamp: hoursAgo(12.5), message: 'Ground confirmation: routine industrial activity' },
      { timestamp: hoursAgo(11.9), message: 'Incident resolved' },
    ],
  },
];
