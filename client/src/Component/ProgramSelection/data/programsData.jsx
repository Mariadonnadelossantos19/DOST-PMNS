export const programs = [
   {
      id: 'SETUP',
      code: 'SETUP',
      name: 'Small Enterprise Technology Upgrading Program',
      description: 'Technology upgrading and capacity building for small enterprises to enhance productivity and competitiveness.',
      icon: (
         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
         </svg>
      ),
      color: 'green',
      benefits: [
         'Technology assessment and upgrading',
         'Training and capacity building',
         'Equipment and tool support',
         'Market linkage assistance'
      ],
      documentRequirements: [
         {
            id: 'letterOfIntent',
            name: 'Letter of Intent',
            description: 'Formal letter expressing interest in the SETUP program',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '5MB'
         },
         {
            id: 'enterpriseProfile',
            name: 'Enterprise Profile',
            description: 'Comprehensive profile of the enterprise including business details',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'businessPlan',
            name: 'Business Plan',
            description: 'Detailed business plan with financial projections',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'financialStatements',
            name: 'Financial Statements',
            description: 'Latest 2 years audited financial statements',
            required: true,
            fileTypes: ['.pdf', '.xls', '.xlsx'],
            maxSize: '5MB'
         },
         {
            id: 'registrationDocuments',
            name: 'Registration Documents',
            description: 'SEC/DTI registration and other business permits',
            required: true,
            fileTypes: ['.pdf', '.jpg', '.png'],
            maxSize: '5MB'
         }
      ]
   },
   {
      id: 'GIA',
      code: 'GIA',
      name: 'Grants-in-Aid Program',
      description: 'Financial assistance for research and development projects that promote science and technology innovation.',
      icon: (
         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"/>
            <path d="M9 12L11 14L15 10"/>
         </svg>
      ),
      color: 'blue',
      benefits: [
         'Research funding support',
         'Innovation project grants',
         'Equipment and facility access',
         'Technical expertise assistance'
      ],
      documentRequirements: [
         {
            id: 'researchProposal',
            name: 'Research Proposal',
            description: 'Detailed research proposal with methodology and objectives',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'curriculumVitae',
            name: 'Principal Investigator CV',
            description: 'Curriculum vitae of the principal investigator',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '5MB'
         },
         {
            id: 'budgetProposal',
            name: 'Budget Proposal',
            description: 'Detailed budget breakdown for the research project',
            required: true,
            fileTypes: ['.pdf', '.xls', '.xlsx'],
            maxSize: '5MB'
         },
         {
            id: 'institutionalEndorsement',
            name: 'Institutional Endorsement',
            description: 'Letter of endorsement from the institution',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '5MB'
         }
      ]
   },
   {
      id: 'CEST',
      code: 'CEST',
      name: 'Community Empowerment through Science and Technology',
      description: 'Community-based programs that use science and technology to address local development challenges.',
      icon: (
         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"/>
            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"/>
         </svg>
      ),
      color: 'orange',
      benefits: [
         'Community needs assessment',
         'Local technology solutions',
         'Capacity building programs',
         'Sustainable development support'
      ],
      documentRequirements: [
         {
            id: 'communityProfile',
            name: 'Community Profile',
            description: 'Comprehensive profile of the target community',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'projectProposal',
            name: 'Project Proposal',
            description: 'Detailed project proposal addressing community needs',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'communityEndorsement',
            name: 'Community Endorsement',
            description: 'Letter of endorsement from community leaders',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '5MB'
         },
         {
            id: 'implementationPlan',
            name: 'Implementation Plan',
            description: 'Detailed plan for project implementation',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '5MB'
         }
      ]
   },
   {
      id: 'SSCP',
      code: 'SSCP',
      name: 'Smart and Sustainable Communities Program',
      description: 'Support for small and medium enterprises in commercializing innovative products and technologies.',
      icon: (
         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z"/>
            <path d="M8 8H16V10H8V8Z"/>
            <path d="M8 12H16V14H8V12Z"/>
            <path d="M8 16H12V18H8V16Z"/>
         </svg>
      ),
      color: 'purple',
      benefits: [
         'Market research support',
         'Business plan development',
         'Commercialization strategy',
         'Investment and funding assistance'
      ],
      documentRequirements: [
         {
            id: 'innovationProposal',
            name: 'Innovation Proposal',
            description: 'Detailed proposal for the innovative product or technology',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'marketAnalysis',
            name: 'Market Analysis',
            description: 'Comprehensive market analysis and feasibility study',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'commercializationPlan',
            name: 'Commercialization Plan',
            description: 'Detailed plan for commercializing the innovation',
            required: true,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '10MB'
         },
         {
            id: 'intellectualProperty',
            name: 'Intellectual Property Documents',
            description: 'Patent applications, trademarks, or other IP documentation',
            required: false,
            fileTypes: ['.pdf', '.doc', '.docx'],
            maxSize: '5MB'
         }
      ]
   }
];
