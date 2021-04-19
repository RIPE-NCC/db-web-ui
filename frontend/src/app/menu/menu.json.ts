export const menuObject =  {
  "main": [
    {
      "title": "My Account",
      "id": "account",
      "url": "PORTAL_URL",
      "icon": "<svg aria-hidden='true' focusable='false' data-prefix='fal' data-icon='server' class='svg-inline--fa fa-server fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M376 256c0-13.255 10.745-24 24-24s24 10.745 24 24-10.745 24-24 24-24-10.745-24-24zm-40 24c13.255 0 24-10.745 24-24s-10.745-24-24-24-24 10.745-24 24 10.745 24 24 24zm176-128c0 12.296-4.629 23.507-12.232 32 7.603 8.493 12.232 19.704 12.232 32v80c0 12.296-4.629 23.507-12.232 32 7.603 8.493 12.232 19.704 12.232 32v80c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48v-80c0-12.296 4.629-23.507 12.232-32C4.629 319.507 0 308.296 0 296v-80c0-12.296 4.629-23.507 12.232-32C4.629 175.507 0 164.296 0 152V72c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v80zm-480 0c0 8.822 7.178 16 16 16h416c8.822 0 16-7.178 16-16V72c0-8.822-7.178-16-16-16H48c-8.822 0-16 7.178-16 16v80zm432 48H48c-8.822 0-16 7.178-16 16v80c0 8.822 7.178 16 16 16h416c8.822 0 16-7.178 16-16v-80c0-8.822-7.178-16-16-16zm16 160c0-8.822-7.178-16-16-16H48c-8.822 0-16 7.178-16 16v80c0 8.822 7.178 16 16 16h416c8.822 0 16-7.178 16-16v-80zm-80-224c13.255 0 24-10.745 24-24s-10.745-24-24-24-24 10.745-24 24 10.745 24 24 24zm-64 0c13.255 0 24-10.745 24-24s-10.745-24-24-24-24 10.745-24 24 10.745 24 24 24zm64 240c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zm-64 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z'></path></svg>",
      "roles": ["admin", "general", "billing", "generalMeeting", "ticketing", "guest"]
    },
    {
      "title": "Request & Transfer Resources",
      "subtitle": "Request Resources, Request Transfer, IPv4 Transfer Listing Service",
      "id": "requests_transfers",
      "url": "PORTAL_URL",
      "icon": "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fal\" data-icon=\"exchange-alt\" class=\"svg-inline--fa fa-exchange-alt fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path fill=\"currentColor\" d=\"M12 192h372v56c0 29.552 36.528 43.072 55.917 21.26l64-72c10.777-12.124 10.777-30.395 0-42.519l-64-72C420.535 60.936 384 74.436 384 104v56H12c-6.627 0-12 5.373-12 12v8c0 6.627 5.373 12 12 12zm404-88l64 72-64 72V104zm84 216H128v-56c0-29.552-36.528-43.072-55.917-21.26l-64 72c-10.777 12.124-10.777 30.395 0 42.519l64 72C91.465 451.064 128 437.564 128 408v-56h372c6.627 0 12-5.373 12-12v-8c0-6.627-5.373-12-12-12zM96 408l-64-72 64-72v144z\"></path></svg>",
      "roles": ["admin", "billing", "certification", "general", "generalMeeting", "myResources", "ticketing"]
    },
    {
      "title": "My Resources",
      "subtitle": "My & Sponsored Resources",
      "id": "resources",
      "icon": "<svg aria-hidden='true' focusable='false' data-prefix='fal' data-icon='ethernet' class='svg-inline--fa fa-ethernet fa-w-16' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M496 192h-48v-48c0-8.8-7.2-16-16-16h-48V80c0-8.8-7.2-16-16-16H144c-8.8 0-16 7.2-16 16v48H80c-8.8 0-16 7.2-16 16v48H16c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16V208c0-8.8-7.2-16-16-16zm-16 224h-64V288h-32v128h-64V288h-32v128h-64V288h-32v128h-64V288H96v128H32V224h64v-64h64V96h192v64h64v64h64v192z'></path></svg>",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "myResources", "ticketing"]
    }, {
      "title": "My Resources",
      "id": "myresources",
      "parent": "resources",
      "url": "MY_RESOURCES_URL",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "myResources", "ticketing"]
    }, {
      "title": "Sponsored Resources",
      "id": "sponsored",
      "parent": "resources",
      "url": "MY_RESOURCES_URL",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "myResources", "ticketing"]
    },
    {
      "title": "RIPE Database",
      "id": "database",
      "icon": "<svg aria-hidden='true' focusable='false' data-prefix='fal' data-icon='database' class='svg-inline--fa fa-database fa-w-14' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M224 32c106 0 192 28.75 192 64v32c0 35.25-86 64-192 64S32 163.25 32 128V96c0-35.25 86-64 192-64m192 149.5V224c0 35.25-86 64-192 64S32 259.25 32 224v-42.5c41.25 29 116.75 42.5 192 42.5s150.749-13.5 192-42.5m0 96V320c0 35.25-86 64-192 64S32 355.25 32 320v-42.5c41.25 29 116.75 42.5 192 42.5s150.749-13.5 192-42.5m0 96V416c0 35.25-86 64-192 64S32 451.25 32 416v-42.5c41.25 29 116.75 42.5 192 42.5s150.749-13.5 192-42.5M224 0C145.858 0 0 18.801 0 96v320c0 77.338 146.096 96 224 96 78.142 0 224-18.801 224-96V96c0-77.338-146.096-96-224-96z'></path></svg>",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "guest", "myResources", "ticketing"]
    }, {
      "title": "Query the RIPE Database",
      "id": "query",
      "parent": "database",
      "url": "DATABASE_QUERY_URL",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "guest", "myResources", "ticketing"]
    }, {
      "title": "Full Text Search",
      "id": "fulltextsearch",
      "parent": "database",
      "url": "DATABASE_FULL_TEXT_SEARCH_URL",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "guest", "myResources", "ticketing"]
    }, {
      "title": "Syncupdates",
      "id": "syncupdates",
      "parent": "database",
      "url": "DATABASE_SYNCUPDATES_URL",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "guest", "myResources", "ticketing"]
    }, {
      "title": "Create an Object",
      "id": "create",
      "parent": "database",
      "url": "DATABASE_CREATE_URL",
      "roles": ["unauthorised", "admin", "billing", "certification", "general", "generalMeeting", "guest", "myResources", "ticketing"]
    },
    {
      "title": "RPKI Dashboard",
      "id": "rpki_dashboard",
      "url": "RPKI_DASHBOARD_URL",
      "icon":
          "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fal\" data-icon=\"tachometer-alt-fast\" class=\"svg-inline--fa fa-tachometer-alt-fast fa-w-18\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><path fill=\"currentColor\" d=\"M120 320c0 13.26-10.74 24-24 24s-24-10.74-24-24 10.74-24 24-24 24 10.74 24 24zm168-168c13.26 0 24-10.74 24-24s-10.74-24-24-24-24 10.74-24 24 10.74 24 24 24zm-136 8c-13.26 0-24 10.74-24 24s10.74 24 24 24 24-10.74 24-24-10.74-24-24-24zm282.06 11.56c6.88 5.56 7.94 15.64 2.38 22.5l-97.14 120C347.18 324.7 352 337.74 352 352c0 35.35-28.65 64-64 64s-64-28.65-64-64 28.65-64 64-64c9.47 0 18.38 2.18 26.47 5.88l97.09-119.94c5.56-6.88 15.6-7.92 22.5-2.38zM320 352c0-17.67-14.33-32-32-32s-32 14.33-32 32 14.33 32 32 32 32-14.33 32-32zm160-56c-13.26 0-24 10.74-24 24s10.74 24 24 24 24-10.74 24-24-10.74-24-24-24zm96 24c0 52.8-14.25 102.26-39.06 144.8-5.61 9.62-16.3 15.2-27.44 15.2h-443c-11.14 0-21.83-5.58-27.44-15.2C14.25 422.26 0 372.8 0 320 0 160.94 128.94 32 288 32s288 128.94 288 288zm-32 0c0-141.16-114.84-256-256-256S32 178.84 32 320c0 45.26 12 89.75 34.7 128.68l442.8-.68C532 409.75 544 365.26 544 320z\"></path></svg>",
      "roles": ["certification"]
    }
  ],
  "footer": [
    {
      "title": "Documentation",
      "id": "docs",
      "url": "https://www.ripe.net/manage-ips-and-asns/db/support/documentation/ripe-database-documentation",
      "icon":
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M356 160H188c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12zm12 52v-8c0-6.6-5.4-12-12-12H188c-6.6 0-12 5.4-12 12v8c0 6.6 5.4 12 12 12h168c6.6 0 12-5.4 12-12zm64.7 268h3.3c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12H80c-44.2 0-80-35.8-80-80V80C0 35.8 35.8 0 80 0h344c13.3 0 24 10.7 24 24v368c0 10-6.2 18.6-14.9 22.2-3.6 16.1-4.4 45.6-.4 65.8zM128 384h288V32H128v352zm-96 16c13.4-10 30-16 48-16h16V32H80c-26.5 0-48 21.5-48 48v320zm372.3 80c-3.1-20.4-2.9-45.2 0-64H80c-64 0-64 64 0 64h324.3z'></path></svg>"
    },
    {
      "title": "Feedback",
      "id": "feedback",
      "subtitle": "Tell us what you think",
      "url": "https://www.ripe.net/support/contact",
      "icon":
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 7.1 5.8 12 12 12 2.4 0 4.9-.7 7.1-2.4L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zm32 352c0 17.6-14.4 32-32 32H293.3l-8.5 6.4L192 460v-76H64c-17.6 0-32-14.4-32-32V64c0-17.6 14.4-32 32-32h384c17.6 0 32 14.4 32 32v288z'></path></svg>"
    },
    {
      "title": "Legal",
      "id": "legal",
      "subtitle": "Copyright, Privacy, Terms and cookies",
      "url": "LEGAL",
      "icon": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'><path fill='currentColor' d='M634.4 375.09L525.35 199.12c-3.17-4.75-8.26-7.12-13.35-7.12s-10.18 2.38-13.35 7.12L389.6 375.09c-3.87 5.78-6.09 12.72-5.51 19.64C389.56 460.4 444.74 512 512 512c67.27 0 122.45-51.6 127.91-117.27.57-6.92-1.64-13.86-5.51-19.64zM511.96 238.24L602.27 384H421.02l90.94-145.76zM512 480c-41.28 0-77-26.77-90.42-64h181.2c-13.23 36.87-49.2 64-90.78 64zm17.89-317.21l5.08-15.17c1.4-4.19-.86-8.72-5.05-10.12L379.46 87.15C382.33 79.98 384 72.21 384 64c0-35.35-28.65-64-64-64-29.32 0-53.77 19.83-61.34 46.73L120.24.42c-4.19-1.4-8.72.86-10.12 5.05l-5.08 15.17c-1.4 4.19.86 8.72 5.05 10.12l148.29 49.62c5.91 22.23 23.33 39.58 45.62 45.36V480H104c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8h224c4.42 0 8-3.58 8-8V125.74c8.64-2.24 16.5-6.22 23.32-11.58l160.45 53.68c4.18 1.4 8.71-.86 10.12-5.05zM320 96c-17.64 0-32-14.36-32-32s14.36-32 32-32 32 14.36 32 32-14.36 32-32 32zm-64.09 170.73c.58-6.92-1.64-13.86-5.51-19.64L141.35 71.12C138.18 66.38 133.09 64 128 64s-10.18 2.38-13.35 7.12L5.6 247.09c-3.87 5.78-6.09 12.72-5.51 19.64C5.56 332.4 60.74 384 128 384s122.44-51.6 127.91-117.27zM127.96 110.24L218.27 256H37.02l90.94-145.76zM37.58 288h181.2c-13.23 36.87-49.2 64-90.78 64-41.28 0-77-26.77-90.42-64z'/></svg>"
    }
  ]
}
