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
      color: 'blue',
      benefits: [
         'Technology assessment and upgrading',
         'Training and capacity building',
         'Equipment and tool support',
         'Market linkage assistance'
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
      color: 'green',
      benefits: [
         'Research funding support',
         'Innovation project grants',
         'Equipment and facility access',
         'Technical expertise assistance'
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
      color: 'purple',
      benefits: [
         'Community needs assessment',
         'Local technology solutions',
         'Capacity building programs',
         'Sustainable development support'
      ]
   },
   {
      id: 'SSCP',
      code: 'SSCP',
      name: 'Small Scale Commercialization Program',
      description: 'Support for small and medium enterprises in commercializing innovative products and technologies.',
      icon: (
         <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z"/>
            <path d="M8 8H16V10H8V8Z"/>
            <path d="M8 12H16V14H8V12Z"/>
            <path d="M8 16H12V18H8V16Z"/>
         </svg>
      ),
      color: 'orange',
      benefits: [
         'Market research support',
         'Business plan development',
         'Commercialization strategy',
         'Investment and funding assistance'
      ]
   }
];
