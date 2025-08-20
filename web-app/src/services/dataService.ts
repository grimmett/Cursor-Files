// Data service using real Bridgit data
export interface PunchlistItem {
  id: string;
  taskNumber: number;
  title: string;
  description?: string;
  location: string;
  tags?: string;
  assignedTo: string;
  createdDate: string;
  createdBy: string;
  lastModifiedDate: string;
  lastModifiedBy: string;
  completedDate?: string;
  completedBy?: string;
  approvedDate?: string;
  approvedBy?: string;
  status: 'Open' | 'Closed' | 'Pending Approval' | 'Draft';
  dueDate?: string;
  value?: number;
  trade?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  draftTasks: number;
  completionPercentage: number;
  trades: Record<string, number>;
}

// Real data from your Bridgit export (sample subset)
const bridgitTasks: PunchlistItem[] = [
  {
    id: '1321',
    taskNumber: 1321,
    title: '1001 - Throughout - Paint cleanup',
    description: '',
    location: 'FLOOR 10 > UNIT 1001 (1BR-D)',
    tags: '',
    assignedTo: 'NEW YORK PAINTING & COATING LTD.: Farha Ladiwala',
    createdDate: '06-August-2021',
    createdBy: 'Synergy: Dale',
    lastModifiedDate: '14-September-2021',
    lastModifiedBy: 'Ledcor Construction Limited: Alex Svedic',
    completedDate: '31-August-2021',
    completedBy: 'Ledcor Construction Limited: Carlson Lau',
    approvedDate: '14-September-2021',
    approvedBy: 'Ledcor Construction Limited: Alex Svedic',
    status: 'Closed',
    value: 150,
    trade: 'Painting'
  },
  {
    id: '1320',
    taskNumber: 1320,
    title: '1001 - Throughout - Paint touchups',
    description: '',
    location: 'FLOOR 10 > UNIT 1001 (1BR-D)',
    tags: 'PAINT TOUCHUPS',
    assignedTo: 'NEW YORK PAINTING & COATING LTD.: Farha Ladiwala',
    createdDate: '06-August-2021',
    createdBy: 'Synergy: Dale',
    lastModifiedDate: '14-September-2021',
    lastModifiedBy: 'Ledcor Construction Limited: Alex Svedic',
    completedDate: '30-August-2021',
    completedBy: 'Ledcor Construction Limited: Charlie Thompson',
    approvedDate: '14-September-2021',
    approvedBy: 'Ledcor Construction Limited: Alex Svedic',
    status: 'Closed',
    value: 100,
    trade: 'Painting'
  },
  {
    id: '1327',
    taskNumber: 1327,
    title: '1001 - Balcony - mullion scratches',
    description: '',
    location: 'FLOOR 10 > UNIT 1001 (1BR-D) > BALCONY',
    tags: 'MULLION DEFECTS',
    assignedTo: 'BV GLAZING SYSTEMS LIMITED: Fabien Mowlah-Baksh',
    createdDate: '06-August-2021',
    createdBy: 'Synergy: Dale',
    lastModifiedDate: '14-September-2021',
    lastModifiedBy: 'Ledcor Construction Limited: Alex Svedic',
    completedDate: '31-August-2021',
    completedBy: 'The Deficiency Group: Ken',
    approvedDate: '14-September-2021',
    approvedBy: 'Ledcor Construction Limited: Alex Svedic',
    status: 'Closed',
    value: 70,
    trade: 'Glazing'
  }
];

// Simulate different statuses for demo
const mockCurrentTasks: PunchlistItem[] = [
  {
    ...bridgitTasks[0],
    id: 'current-1',
    taskNumber: 2001,
    title: 'L15 - Kitchen - Cabinet door alignment',
    status: 'Open',
    completedDate: undefined,
    completedBy: undefined,
    approvedDate: undefined,
    approvedBy: undefined,
    trade: 'General'
  },
  {
    ...bridgitTasks[1],
    id: 'current-2',
    taskNumber: 2002,
    title: 'L12 - Bathroom - Tile grout repair',
    status: 'Pending Approval',
    completedDate: '15-August-2025',
    completedBy: 'ABC Contracting: John Smith',
    approvedDate: undefined,
    approvedBy: undefined,
    trade: 'General'
  },
  {
    ...bridgitTasks[2],
    id: 'current-3',
    taskNumber: 2003,
    title: 'L08 - Living Room - Paint touch-up',
    status: 'Draft',
    completedDate: undefined,
    completedBy: undefined,
    approvedDate: undefined,
    approvedBy: undefined,
    trade: 'Painting'
  }
];

export const dataService = {
  // Get project overview data
  getProjectOverview: (): Project => {
    const allTasks = [...bridgitTasks, ...mockCurrentTasks];
    
    const statusCounts = {
      Open: allTasks.filter(t => t.status === 'Open').length,
      Closed: allTasks.filter(t => t.status === 'Closed').length,
      'Pending Approval': allTasks.filter(t => t.status === 'Pending Approval').length,
      Draft: allTasks.filter(t => t.status === 'Draft').length,
    };

    const tradeCounts = allTasks.reduce((acc, task) => {
      const trade = task.trade || 'General';
      acc[trade] = (acc[trade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedTasks = statusCounts.Closed + statusCounts['Pending Approval'];
    const totalTasks = allTasks.length;

    return {
      id: 'pacific-pdi',
      name: 'The Pacific - Owner\'s Deficiencies',
      description: 'Construction punchlist for The Pacific development project',
      totalTasks,
      openTasks: statusCounts.Open,
      completedTasks,
      draftTasks: statusCounts.Draft,
      completionPercentage: Math.round((completedTasks / totalTasks) * 100),
      trades: tradeCounts
    };
  },

  // Get tasks by status
  getTasksByStatus: (status?: string): PunchlistItem[] => {
    const allTasks = [...bridgitTasks, ...mockCurrentTasks];
    
    if (status) {
      return allTasks.filter(task => task.status === status);
    }
    return allTasks;
  },

  // Get dashboard metrics
  getDashboardMetrics: () => {
    const project = dataService.getProjectOverview();
    const allTasks = [...bridgitTasks, ...mockCurrentTasks];
    
    // Calculate values
    const totalValue = allTasks.reduce((sum, task) => sum + (task.value || 0), 0);
    const completedValue = allTasks
      .filter(task => task.status === 'Closed')
      .reduce((sum, task) => sum + (task.value || 0), 0);

    return {
      totalTasks: project.totalTasks,
      openTasks: project.openTasks,
      completedTasks: project.completedTasks,
      draftTasks: project.draftTasks,
      completionPercentage: project.completionPercentage,
      totalValue,
      completedValue,
      trades: project.trades,
      recentActivity: allTasks
        .filter(task => task.lastModifiedDate)
        .sort((a, b) => new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime())
        .slice(0, 5)
    };
  },

  // Get task by ID
  getTaskById: (id: string): PunchlistItem | undefined => {
    const allTasks = [...bridgitTasks, ...mockCurrentTasks];
    return allTasks.find(task => task.id === id);
  },

  // Get tasks by trade
  getTasksByTrade: (trade: string): PunchlistItem[] => {
    const allTasks = [...bridgitTasks, ...mockCurrentTasks];
    return allTasks.filter(task => task.trade === trade);
  },

  // Get location analysis
  getLocationAnalysis: () => {
    const allTasks = [...bridgitTasks, ...mockCurrentTasks];
    const locationCounts = allTasks.reduce((acc, task) => {
      const location = task.location || '';
      const floor = location.includes('FLOOR') ? location.split(' >')[0] : 'Other';
      acc[floor] = (acc[floor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }
};