const fs = require('fs');
const readline = require('readline');
const {createClient} = require("@supabase/supabase-js");
// Create a read stream and use readline to process the file line by line
// const stream = fs.createReadStream('free_company_dataset.json', { encoding: 'utf8' });
// const rl = readline.createInterface({ input: stream });
const LineByLineReader = require('line-by-line');
lr = new LineByLineReader('../../../Downloads/free_company_dataset.json');
const sizeRange =  {
    '1-10': 0,
    '11-50': 1,
    '51-200': 2,
    '201-500': 3,
    '501-1000': 4,
    '1001-5000': 5,
    '5001-10000': 6,
    '10001+': 7
  }

let companies = [];

// const createAdminClient = () => {
//     console.log("Creating admin client")
//     return createClient(
//         process.env.SUPABASE_URL,
//         process.env.SUPABASE_SERVICE_KEY, 
//         {auth: {
//             persistSession: false,
//             autoRefreshToken: false,
//             detectSessionInUrl: false,
//           },}
//     );
// }

// const supabaseAdmin = createAdminClient();
const batchSize = 900; 
const delayBetweenRequests = 1100; 
let hasWebsites = 0;
let totalCompanies = 0;
lr.on('line', async (line) => {
    lr.pause();
    try {
        const data = JSON.parse(line);
        // console.log(data.region);

        if (data.website === 'gci.com' && data.region === 'alaska') {
            console.log(data);
        }
        totalCompanies++;


        // if (data.website) {
        //     const newCompany = {
        //         website: `http://www.${data.website}`,
        //         size: sizeRange[data.size],
        //         industry: data.industry,
        //         founded: data.founded,
        //         locality: data.locality,
        //         region: data.region,
        //         country: data.country,
        //         linkedin_url: data.linkedin_url
        //     }
        //     companies.push(newCompany);
        //     if (companies.length >= batchSize) {
        //         supabaseAdmin.from('organization_size').upsert(companies, {onConflict:'website'}).then(response => {
        //             console.log("supabase response: ", response);
        //         }).catch(error => {
        //             console.log(error);
        //         });
        //         companies = [];
        //         await delay(delayBetweenRequests);
        //     }

        // }
    } catch (e) {
        console.error('Error parsing line:', e);
    }
    lr.resume();
});

lr.on('end', () => {
    console.log("done")
    console.log("Total companies: ", totalCompanies);
    console.log("Companies with websites: ", hasWebsites);
    // if (companies.length > 0) {
    //     supabaseAdmin.from('organization_size').upsert(companies, {onConflict:'website'}).then(response => {
    //         console.log(response);
    //     }).catch(error => {
    //         console.log(error);
    //     });
    // }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

