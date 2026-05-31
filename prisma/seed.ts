import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type LocationNode = {
    name: string;
    cities: string[];
};

type ProvinceNode = {
    name: string;
    districts: LocationNode[];
};

const locationHierarchy: ProvinceNode[] = [
    {
        name: 'Bagmati Province',
        districts: [
            { name: 'Kathmandu', cities: ['Kathmandu Metropolitan City', 'Kageshwori Manohara Municipality', 'Gokarneshwor Municipality', 'Tokha Municipality', 'Tarakeshwar Municipality', 'Nagarjun Municipality', 'Budhanilkantha Municipality', 'Chandragiri Municipality', 'Dakshinkali Municipality', 'Shankharapur Municipality', 'Kirtipur Municipality'] },
            { name: 'Lalitpur', cities: ['Lalitpur Metropolitan City', 'Godawari Municipality', 'Mahalaxmi Municipality', 'Konjyosom Rural Municipality', 'Bagmati Rural Municipality', 'Mahankal Rural Municipality'] },
            { name: 'Bhaktapur', cities: ['Bhaktapur Municipality', 'Madhyapur Thimi Municipality', 'Suryabinayak Municipality', 'Changunarayan Municipality'] },
            { name: 'Kavrepalanchok', cities: ['Dhulikhel Municipality', 'Banepa Municipality', 'Panauti Municipality', 'Panchkhal Municipality', 'Namobuddha Municipality', 'Mandandeupur Municipality', 'Bethanchok Rural Municipality', 'Temal Rural Municipality', 'Chauri Deurali Rural Municipality', 'Bhumlu Rural Municipality', 'Roshi Rural Municipality', 'Mahabharat Rural Municipality', 'Khanikhola Rural Municipality'] },
            { name: 'Sindhupalchok', cities: ['Chautara Sangachokgadhi Municipality', 'Melamchi Municipality', 'Barhabise Municipality', 'Balephi Rural Municipality', 'Bhotekoshi Rural Municipality', 'Helambu Rural Municipality', 'Indrawati Rural Municipality', 'Jugal Rural Municipality', 'Lisankhu Pakhar Rural Municipality', 'Panchpokhari Thangpal Rural Municipality', 'Sunkoshi Rural Municipality', 'Tripurasundari Rural Municipality'] },
            { name: 'Dolakha', cities: ['Bhimeshwar Municipality', 'Baiteshwor Rural Municipality', 'Jiri Municipality', 'Kalinchok Rural Municipality', 'Melung Rural Municipality', 'Shailung Rural Municipality', 'Tamakoshi Rural Municipality', 'Gaurishankar Rural Municipality', 'Bigu Rural Municipality'] },
            { name: 'Ramechhap', cities: ['Manthali Municipality', 'Ramechhap Municipality', 'Doramba Shailung Rural Municipality', 'Gokulganga Rural Municipality', 'Khandadevi Rural Municipality', 'Likhu Tamakoshi Rural Municipality', 'Sunapati Rural Municipality', 'Umakunda Rural Municipality'] },
            { name: 'Sindhuli', cities: ['Kamalamai Municipality', 'Dudhauli Municipality', 'Golanjor Rural Municipality', 'Ghanglekh Rural Municipality', 'Hariharpurgaghi Rural Municipality', 'Marin Rural Municipality', 'Phikkal Rural Municipality', 'Sunkoshi Rural Municipality', 'Tinpatan Rural Municipality'] },
            { name: 'Makwanpur', cities: ['Hetauda Sub-Metropolitan City', 'Thaha Municipality', 'Bagmati Rural Municipality', 'Bakaiya Rural Municipality', 'Bhimphedi Rural Municipality', 'Indrasarowar Rural Municipality', 'Kailash Rural Municipality', 'Makawanpurgadhi Rural Municipality', 'Manahari Rural Municipality', 'Raksirang Rural Municipality'] },
            { name: 'Chitwan', cities: ['Bharatpur Metropolitan City', 'Ratnanagar Municipality', 'Khairahani Municipality', 'Madi Municipality', 'Ichchhakamana Rural Municipality'] },
            { name: 'Rasuwa', cities: ['Uttargaya Rural Municipality', 'Kalika Rural Municipality', 'Gosaikunda Rural Municipality', 'Naukunda Rural Municipality', 'Aamachhodingmo Rural Municipality'] },
            { name: 'Nuwakot', cities: ['Bidur Municipality', 'Belkotgadhi Municipality', 'Kakani Rural Municipality', 'Kispang Rural Municipality', 'Likhu Rural Municipality', 'Dupcheshwar Rural Municipality', 'Shivapuri Rural Municipality', 'Tadi Rural Municipality', 'Suryagadhi Rural Municipality', 'Panchakanya Rural Municipality', 'Tarkeshwar Rural Municipality', 'Myagang Rural Municipality'] },
            { name: 'Dhading', cities: ['Nilkantha Municipality', 'Khaniyabas Rural Municipality', 'Gajuri Rural Municipality', 'Galchhi Rural Municipality', 'Gangajamuna Rural Municipality', 'Jwalamukhi Rural Municipality', 'Netrawati Dabjong Rural Municipality', 'Benighat Rorang Rural Municipality', 'Rubi Valley Rural Municipality', 'Siddhalek Rural Municipality', 'Thakre Rural Municipality', 'Tripurasundari Rural Municipality', 'Dhunibesi Municipality'] },
        ],
    },
    {
        name: 'Koshi Province',
        districts: [
            { name: 'Bhojpur', cities: ['Bhojpur Municipality', 'Arun Rural Municipality', 'Aamchowk Rural Municipality', 'Hatuwagadhi Rural Municipality', 'Pauwadungma Rural Municipality', 'Ramprasad Rai Rural Municipality', 'Salpasilichho Rural Municipality', 'Shadananda Municipality', 'Tyamke Maiyum Rural Municipality'] },
            { name: 'Dhankuta', cities: ['Dhankuta Municipality', 'Mahalaxmi Municipality', 'Pakhribas Municipality', 'Chaubise Rural Municipality', 'Sangurigadhi Rural Municipality', 'Shahidbhumi Rural Municipality', 'Chhathar Jorpati Rural Municipality'] },
            { name: 'Ilam', cities: ['Ilam Municipality', 'Deumai Municipality', 'Mai Municipality', 'Suryodaya Municipality', 'Chulachuli Rural Municipality', 'Fakphokthum Rural Municipality', 'Mai Jogmai Rural Municipality', 'Mangsebung Rural Municipality', 'Rong Rural Municipality', 'Sandakpur Rural Municipality'] },
            { name: 'Jhapa', cities: ['Bhadrapur Municipality', 'Birtamod Municipality', 'Damak Municipality', 'Gauradaha Municipality', 'Kankai Municipality', 'Mechinagar Municipality', 'Shivasatakshi Municipality', 'Arjundhara Municipality', 'Kamal Rural Municipality', 'Barhadashi Rural Municipality', 'Buddhashanti Rural Municipality', 'Gaurigunj Rural Municipality', 'Haldibari Rural Municipality', 'Jhapa Rural Municipality', 'Kachankawal Rural Municipality'] },
            { name: 'Khotang', cities: ['Diktel Rupakot Majhuwagadhi Municipality', 'Halesi Tuwachung Municipality', 'Aiselukharka Rural Municipality', 'Barahapokhari Rural Municipality', 'Jantedhunga Rural Municipality', 'Kepilasgadhi Rural Municipality', 'Khotehang Rural Municipality', 'Rawabesi Rural Municipality', 'Sakela Rural Municipality', 'Diprung Chuichumma Rural Municipality'] },
            { name: 'Morang', cities: ['Biratnagar Metropolitan City', 'Belbari Municipality', 'Letang Municipality', 'Pathari Shanischare Municipality', 'Rangeli Municipality', 'Ratuwamai Municipality', 'Sunwarshi Municipality', 'Sundarharaicha Municipality', 'Urlabari Municipality', 'Budhiganga Rural Municipality', 'Dhanpalthan Rural Municipality', 'Gramthan Rural Municipality', 'Jahada Rural Municipality', 'Kanepokhari Rural Municipality', 'Katahari Rural Municipality', 'Kerabari Rural Municipality', 'Miklajung Rural Municipality'] },
            { name: 'Okhaldhunga', cities: ['Siddhicharan Municipality', 'Champadevi Rural Municipality', 'Chisankhugadhi Rural Municipality', 'Khijidemba Rural Municipality', 'Likhu Rural Municipality', 'Manebhanjyang Rural Municipality', 'Molung Rural Municipality', 'Sunkoshi Rural Municipality'] },
            { name: 'Panchthar', cities: ['Phidim Municipality', 'Falelung Rural Municipality', 'Falgunanda Rural Municipality', 'Hilihang Rural Municipality', 'Kummayak Rural Municipality', 'Miklajung Rural Municipality', 'Tumbewa Rural Municipality', 'Yangwarak Rural Municipality'] },
            { name: 'Sankhuwasabha', cities: ['Khandbari Municipality', 'Chainpur Municipality', 'Dharmadevi Municipality', 'Madi Municipality', 'Panchkhapan Municipality', 'Bhotkhola Rural Municipality', 'Chichila Rural Municipality', 'Makalu Rural Municipality', 'Sabhapokhari Rural Municipality', 'Silichong Rural Municipality'] },
            { name: 'Solukhumbu', cities: ['Solu Dudhkunda Municipality', 'Dudhkoshi Rural Municipality', 'Khumbu Pasanglhamu Rural Municipality', 'Likhu Pike Rural Municipality', 'Mahakulung Rural Municipality', 'Necha Salyan Rural Municipality', 'Sotang Rural Municipality', 'Thulung Dudhkoshi Rural Municipality'] },
            { name: 'Sunsari', cities: ['Inaruwa Municipality', 'Dharan Sub-Metropolitan City', 'Itahari Sub-Metropolitan City', 'Barahachhetra Municipality', 'Duhabi Municipality', 'Ramdhuni Municipality', 'Bhokraha Narsingh Rural Municipality', 'Dewanganj Rural Municipality', 'Gadhi Rural Municipality', 'Harinagar Rural Municipality', 'Koshi Rural Municipality', 'Barju Rural Municipality'] },
            { name: 'Taplejung', cities: ['Phungling Municipality', 'Aathrai Tribeni Rural Municipality', 'Meringden Rural Municipality', 'Mikwakhola Rural Municipality', 'Pathibhara Yangwarak Rural Municipality', 'Phaktanglung Rural Municipality', 'Sidingba Rural Municipality', 'Sirijangha Rural Municipality', 'Yangwarak Rural Municipality'] },
            { name: 'Terhathum', cities: ['Myanglung Municipality', 'Laligurans Municipality', 'Aathrai Rural Municipality', 'Chhathar Rural Municipality', 'Phedap Rural Municipality', 'Menchhayayem Rural Municipality'] },
            { name: 'Udayapur', cities: ['Triyuga Municipality', 'Katari Municipality', 'Chaudandigadhi Municipality', 'Belaka Municipality', 'Rautamai Rural Municipality', 'Limchungbung Rural Municipality', 'Tapli Rural Municipality', 'Udayapurgadhi Rural Municipality'] },
        ],
    },
    {
        name: 'Madhesh Province',
        districts: [
            { name: 'Bara', cities: ['Kalaiya Sub-Metropolitan City', 'Jitpur Simara Sub-Metropolitan City', 'Kolhabi Municipality', 'Mahagadhimai Municipality', 'Nijgadh Municipality', 'Pacharauta Municipality', 'Parwanipur Rural Municipality', 'Bishrampur Rural Municipality', 'Prasauni Rural Municipality', 'Karaiyamai Rural Municipality', 'Devtal Rural Municipality', 'Adarsh Kotwal Rural Municipality', 'Baragadhi Rural Municipality', 'Suwarna Rural Municipality', 'Pheta Rural Municipality', 'Simraungadh Municipality'] },
            { name: 'Parsa', cities: ['Birgunj Metropolitan City', 'Pokhariya Municipality', 'Bahudarmai Municipality', 'Parsagadhi Municipality', 'Sakhuwa Prasauni Rural Municipality', 'Jagarnathpur Rural Municipality', 'Chhipaharmai Rural Municipality', 'Pakaha Mainpur Rural Municipality', 'Bindabasini Rural Municipality', 'Dhobini Rural Municipality', 'Kalikamai Rural Municipality', 'Jirabhawani Rural Municipality', 'Thori Rural Municipality', 'Paterwa Sugauli Rural Municipality'] },
            { name: 'Rautahat', cities: ['Gaur Municipality', 'Garuda Municipality', 'Gujara Municipality', 'Chandrapur Municipality', 'Dewahi Gonahi Municipality', 'Brindaban Municipality', 'Madhav Narayan Municipality', 'Baudhimai Municipality', 'Paroha Municipality', 'Rajdevi Municipality', 'Gadhimai Municipality', 'Ishanath Municipality', 'Maulapur Municipality', 'Yamunamai Rural Municipality', 'Durga Bhagwati Rural Municipality', 'Katahariya Municipality', 'Rajpur Municipality', 'Phatuwa Bijayapur Municipality'] },
            { name: 'Sarlahi', cities: ['Malangawa Municipality', 'Bagmati Municipality', 'Balara Municipality', 'Barahathawa Municipality', 'Godaita Municipality', 'Haripur Municipality', 'Haripurwa Municipality', 'Hariwan Municipality', 'Ishworpur Municipality', 'Kabilasi Municipality', 'Lalbandi Municipality', 'Ramnagar Rural Municipality', 'Chakraghatta Rural Municipality', 'Kaudena Rural Municipality', 'Brahmapuri Rural Municipality', 'Basbariya Rural Municipality', 'Dhankaul Rural Municipality', 'Parsa Rural Municipality', 'Bishnu Rural Municipality', 'Chandranagar Rural Municipality'] },
            { name: 'Mahottari', cities: ['Jaleshwar Municipality', 'Aurahi Municipality', 'Balwa Municipality', 'Bardibas Municipality', 'Bhangaha Municipality', 'Gaushala Municipality', 'Loharpatti Municipality', 'Manara Shiswa Municipality', 'Matihani Municipality', 'Ramgopalpur Municipality', 'Ekdara Rural Municipality', 'Mahottari Rural Municipality', 'Pipra Rural Municipality', 'Samsi Rural Municipality', 'Sonama Rural Municipality'] },
            { name: 'Dhanusha', cities: ['Janakpurdham Sub-Metropolitan City', 'Chhireshwarnath Municipality', 'Ganeshman Charnath Municipality', 'Dhanushadham Municipality', 'Hansapur Municipality', 'Mithila Municipality', 'Mithila Bihari Municipality', 'Nagarain Municipality', 'Sabaila Municipality', 'Shahidnagar Municipality', 'Kamala Municipality', 'Bateshwar Rural Municipality', 'Dhanauji Rural Municipality', 'Janaknandini Rural Municipality', 'Lakshminiya Rural Municipality', 'Mukhiyapatti Musaharmiya Rural Municipality', 'Aaurahi Rural Municipality', 'Bideha Municipality'] },
            { name: 'Siraha', cities: ['Siraha Municipality', 'Lahan Municipality', 'Dhangadhimai Municipality', 'Golbazar Municipality', 'Mirchaiya Municipality', 'Kalyanpur Municipality', 'Karjanha Municipality', 'Sukhipur Municipality', 'Naraha Rural Municipality', 'Bariyarpatti Rural Municipality', 'Arnama Rural Municipality', 'Bhagwanpur Rural Municipality', 'Nawarajpur Rural Municipality', 'Sakhuwanankarkatti Rural Municipality', 'Aurahi Rural Municipality', 'Bishnupur Rural Municipality', 'Lakshmipur Patari Rural Municipality'] },
            { name: 'Saptari', cities: ['Rajbiraj Municipality', 'Kanchanrup Municipality', 'Dakneshwori Municipality', 'Bode Barsain Municipality', 'Khadak Municipality', 'Shambhunath Municipality', 'Surunga Municipality', 'Hanumannagar Kankalini Municipality', 'Saptakoshi Municipality', 'Agnisair Krishna Savaran Rural Municipality', 'Balan Bihul Rural Municipality', 'Bishnupur Rural Municipality', 'Chhinnamasta Rural Municipality', 'Mahadeva Rural Municipality', 'Rajgadh Rural Municipality', 'Rupani Rural Municipality', 'Tilathi Koiladi Rural Municipality', 'Tirahut Rural Municipality'] },
        ],
    },
    {
        name: 'Gandaki Province',
        districts: [
            { name: 'Baglung', cities: ['Baglung Municipality', 'Dhorpatan Municipality', 'Galkot Municipality', 'Jaimuni Municipality', 'Bareng Rural Municipality', 'Kanthekhola Rural Municipality', 'Nisikhola Rural Municipality', 'Taman Khola Rural Municipality', 'Tara Khola Rural Municipality', 'Badigad Rural Municipality'] },
            { name: 'Gorkha', cities: ['Gorkha Municipality', 'Palungtar Municipality', 'Sulikot Rural Municipality', 'Siranchok Rural Municipality', 'Ajirkot Rural Municipality', 'Bhimsen Thapa Rural Municipality', 'Chum Nubri Rural Municipality', 'Dharche Rural Municipality', 'Gandaki Rural Municipality', 'Sahid Lakhan Rural Municipality', 'Aarughat Rural Municipality'] },
            { name: 'Kaski', cities: ['Pokhara Metropolitan City', 'Annapurna Rural Municipality', 'Machhapuchchhre Rural Municipality', 'Madi Rural Municipality', 'Rupa Rural Municipality'] },
            { name: 'Lamjung', cities: ['Besisahar Municipality', 'Madhya Nepal Municipality', 'Rainas Municipality', 'Sundarbazar Municipality', 'Kwholasothar Rural Municipality', 'Dordi Rural Municipality', 'Dudhpokhari Rural Municipality', 'Marsyangdi Rural Municipality'] },
            { name: 'Manang', cities: ['Chame Rural Municipality', 'Narpa Bhumi Rural Municipality', 'Nason Rural Municipality', 'Manang Ngisyang Rural Municipality'] },
            { name: 'Mustang', cities: ['Gharpajhong Rural Municipality', 'Thasang Rural Municipality', 'Lo-Ghekar Damodarkunda Rural Municipality', 'Lomanthang Rural Municipality', 'Baragung Muktichhetra Rural Municipality'] },
            { name: 'Myagdi', cities: ['Beni Municipality', 'Annapurna Rural Municipality', 'Dhaulagiri Rural Municipality', 'Malika Rural Municipality', 'Mangala Rural Municipality', 'Raghuganga Rural Municipality'] },
            { name: 'Nawalpur', cities: ['Gaindakot Municipality', 'Kawasoti Municipality', 'Madhyabindu Municipality', 'Devchuli Municipality', 'Binayi Tribeni Rural Municipality', 'Bulingtar Rural Municipality', 'Baudikali Rural Municipality', 'Hupsekot Rural Municipality'] },
            { name: 'Parbat', cities: ['Kushma Municipality', 'Phalewas Municipality', 'Jaljala Rural Municipality', 'Mahashila Rural Municipality', 'Modi Rural Municipality', 'Painyu Rural Municipality', 'Bihadi Rural Municipality'] },
            { name: 'Syangja', cities: ['Putalibazar Municipality', 'Waling Municipality', 'Bhirkot Municipality', 'Chapakot Municipality', 'Galyang Municipality', 'Arjun Chaupari Rural Municipality', 'Aandhikhola Rural Municipality', 'Biruwa Rural Municipality', 'Harinas Rural Municipality', 'Kaligandaki Rural Municipality', 'Phedikhola Rural Municipality'] },
            { name: 'Tanahun', cities: ['Byas Municipality', 'Bhanu Municipality', 'Shuklagandaki Municipality', 'Bhimad Municipality', 'Aanbukhaireni Rural Municipality', 'Bandipur Rural Municipality', 'Devghat Rural Municipality', 'Ghiring Rural Municipality', 'Myagde Rural Municipality', 'Rishing Rural Municipality'] },
        ],
    },
    {
        name: 'Lumbini Province',
        districts: [
            { name: 'Arghakhanchi', cities: ['Sandhikharka Municipality', 'Sitganga Municipality', 'Bhumikasthan Municipality', 'Panini Rural Municipality', 'Malarani Rural Municipality', 'Chhatradev Rural Municipality'] },
            { name: 'Banke', cities: ['Nepalgunj Sub-Metropolitan City', 'Kohalpur Municipality', 'Rapti Sonari Rural Municipality', 'Narainapur Rural Municipality', 'Duduwa Rural Municipality', 'Baijanath Rural Municipality', 'Janaki Rural Municipality', 'Khajura Rural Municipality'] },
            { name: 'Bardiya', cities: ['Gulariya Municipality', 'Madhuwan Municipality', 'Rajapur Municipality', 'Thakurbaba Municipality', 'Barbardiya Municipality', 'Bansgadhi Municipality', 'Geruwa Rural Municipality', 'Badhaiyatal Rural Municipality'] },
            { name: 'Dang', cities: ['Ghorahi Sub-Metropolitan City', 'Tulsipur Sub-Metropolitan City', 'Lamahi Municipality', 'Gadhawa Rural Municipality', 'Rapti Rural Municipality', 'Rajpur Rural Municipality', 'Shantinagar Rural Municipality', 'Babai Rural Municipality', 'Banglachuli Rural Municipality', 'Dangisharan Rural Municipality'] },
            { name: 'Eastern Rukum', cities: ['Putha Uttarganga Rural Municipality', 'Sisne Rural Municipality', 'Bhume Rural Municipality'] },
            { name: 'Gulmi', cities: ['Resunga Municipality', 'Musikot Municipality', 'Kaligandaki Rural Municipality', 'Chandrakot Rural Municipality', 'Dhurkot Rural Municipality', 'Gulmidarbar Rural Municipality', 'Isma Rural Municipality', 'Madane Rural Municipality', 'Malika Rural Municipality', 'Ruru Kshetra Rural Municipality', 'Satyawati Rural Municipality', 'Chhatrakot Rural Municipality'] },
            { name: 'Kapilvastu', cities: ['Kapilvastu Municipality', 'Banganga Municipality', 'Buddhabhumi Municipality', 'Krishnanagar Municipality', 'Maharajgunj Municipality', 'Shivaraj Municipality', 'Yashodhara Rural Municipality', 'Mayadevi Rural Municipality', 'Shuddhodhan Rural Municipality', 'Bijayanagar Rural Municipality'] },
            { name: 'Parasi', cities: ['Ramgram Municipality', 'Sunwal Municipality', 'Bardaghat Municipality', 'Palhinandan Rural Municipality', 'Pratappur Rural Municipality', 'Sarawal Rural Municipality', 'Susta Rural Municipality'] },
            { name: 'Palpa', cities: ['Tansen Municipality', 'Rampur Municipality', 'Rainadevi Chhahara Rural Municipality', 'Rambha Rural Municipality', 'Mathagadhi Rural Municipality', 'Nisdi Rural Municipality', 'Purbakhola Rural Municipality', 'Ribdikot Rural Municipality', 'Tinau Rural Municipality', 'Bagnaskali Rural Municipality'] },
            { name: 'Pyuthan', cities: ['Pyuthan Municipality', 'Sworgadwari Municipality', 'Mandavi Rural Municipality', 'Mallarani Rural Municipality', 'Naubahini Rural Municipality', 'Jhimruk Rural Municipality', 'Gaumukhi Rural Municipality', 'Ayiravati Rural Municipality', 'Sarumarani Rural Municipality'] },
            { name: 'Rolpa', cities: ['Rolpa Municipality', 'Triveni Rural Municipality', 'Lungri Rural Municipality', 'Madi Rural Municipality', 'Runtigadhi Rural Municipality', 'Sukidaha Rural Municipality', 'Gangadev Rural Municipality', 'Paribartan Rural Municipality', 'Sunil Smriti Rural Municipality', 'Thawang Rural Municipality'] },
            { name: 'Rupandehi', cities: ['Butwal Sub-Metropolitan City', 'Siddharthanagar Municipality', 'Tilottama Municipality', 'Devdaha Municipality', 'Lumbini Sanskritik Municipality', 'Sainamaina Municipality', 'Kanchan Rural Municipality', 'Gaidahawa Rural Municipality', 'Marchawari Rural Municipality', 'Mayadevi Rural Municipality', 'Omsatiya Rural Municipality', 'Rohini Rural Municipality', 'Sammarimai Rural Municipality', 'Siyari Rural Municipality', 'Kotahimai Rural Municipality', 'Sudhodhan Rural Municipality'] },
        ],
    },
    {
        name: 'Karnali Province',
        districts: [
            { name: 'Dailekh', cities: ['Narayan Municipality', 'Dullu Municipality', 'Chamunda Bindrasaini Municipality', 'Aathabis Municipality', 'Bhairabi Rural Municipality', 'Bhagawatimai Rural Municipality', 'Dungeshwor Rural Municipality', 'Gurans Rural Municipality', 'Mahabu Rural Municipality', 'Naumule Rural Municipality', 'Thantikandh Rural Municipality'] },
            { name: 'Dolpa', cities: ['Thuli Bheri Municipality', 'Tripurasundari Municipality', 'Dolpo Buddha Rural Municipality', 'Chharka Tangsong Rural Municipality', 'Jagdulla Rural Municipality', 'Kaike Rural Municipality', 'Mudkechula Rural Municipality', 'Shey Phoksundo Rural Municipality'] },
            { name: 'Humla', cities: ['Simkot Rural Municipality', 'Adanchuli Rural Municipality', 'Chankheli Rural Municipality', 'Kharpunath Rural Municipality', 'Namkha Rural Municipality', 'Sarkegad Rural Municipality', 'Tanjakot Rural Municipality'] },
            { name: 'Jajarkot', cities: ['Bheri Municipality', 'Chhedagad Municipality', 'Nalgad Municipality', 'Barekot Rural Municipality', 'Junichande Rural Municipality', 'Kuse Rural Municipality', 'Shivalaya Rural Municipality'] },
            { name: 'Jumla', cities: ['Chandannath Municipality', 'Guthichaur Rural Municipality', 'Hima Rural Municipality', 'Kanakasundari Rural Municipality', 'Patarasi Rural Municipality', 'Sinja Rural Municipality', 'Tatopani Rural Municipality', 'Tila Rural Municipality'] },
            { name: 'Kalikot', cities: ['Khandachakra Municipality', 'Raskot Municipality', 'Tilagupha Municipality', 'Mahawai Rural Municipality', 'Narharinath Rural Municipality', 'Pachaljharana Rural Municipality', 'Palata Rural Municipality', 'Sanni Triveni Rural Municipality', 'Shubha Kalika Rural Municipality'] },
            { name: 'Mugu', cities: ['Chhayanath Rara Municipality', 'Khatyad Rural Municipality', 'Mugum Karmarong Rural Municipality', 'Soru Rural Municipality'] },
            { name: 'Salyan', cities: ['Sharada Municipality', 'Bagchaur Municipality', 'Bangad Kupinde Municipality', 'Kalimati Rural Municipality', 'Kapurkot Rural Municipality', 'Kumakh Rural Municipality', 'Darma Rural Municipality', 'Siddha Kumakh Rural Municipality', 'Chhatreshwari Rural Municipality', 'Tribeni Rural Municipality'] },
            { name: 'Surkhet', cities: ['Birendranagar Municipality', 'Bheriganga Municipality', 'Gurbhakot Municipality', 'Panchapuri Municipality', 'Lekbeshi Municipality', 'Barahatal Rural Municipality', 'Chaukune Rural Municipality', 'Chingad Rural Municipality', 'Simta Rural Municipality'] },
            { name: 'Western Rukum', cities: ['Musikot Municipality', 'Aathbiskot Municipality', 'Chaurjahari Municipality', 'Tribeni Rural Municipality', 'Banphikot Rural Municipality', 'Sanibheri Rural Municipality'] },
        ],
    },
    {
        name: 'Sudurpashchim Province',
        districts: [
            { name: 'Achham', cities: ['Mangalsen Municipality', 'Sanphebagar Municipality', 'Kamalbazar Municipality', 'Panchadewal Binayak Municipality', 'Mellekh Rural Municipality', 'Bannigadhi Jayagadh Rural Municipality', 'Ramaroshan Rural Municipality', 'Dhakari Rural Municipality', 'Turmakhand Rural Municipality', 'Chaurpati Rural Municipality'] },
            { name: 'Baitadi', cities: ['Dasharathchand Municipality', 'Patan Municipality', 'Melauli Municipality', 'Purchaudi Municipality', 'Surnaya Rural Municipality', 'Shivanath Rural Municipality', 'Pancheshwor Rural Municipality', 'Dogadakedar Rural Municipality', 'Dilasaini Rural Municipality', 'Sigas Rural Municipality'] },
            { name: 'Bajhang', cities: ['Jaya Prithvi Municipality', 'Bungal Municipality', 'Talkot Rural Municipality', 'Masta Rural Municipality', 'Chhabis Pathibhera Rural Municipality', 'Thalara Rural Municipality', 'Bitthadchir Rural Municipality', 'Kedarsyu Rural Municipality', 'Khaptad Chhanna Rural Municipality', 'Surma Rural Municipality', 'Saipal Rural Municipality', 'Durgathali Rural Municipality'] },
            { name: 'Bajura', cities: ['Badimalika Municipality', 'Budhinanda Municipality', 'Tribeni Municipality', 'Gaumul Rural Municipality', 'Himali Rural Municipality', 'Jagannath Rural Municipality', 'Swamikartik Khapar Rural Municipality', 'Khaptad Chhededaha Rural Municipality', 'Budhiganga Municipality', 'Budhinanda Municipality'] },
            { name: 'Dadeldhura', cities: ['Amargadhi Municipality', 'Parashuram Municipality', 'Aalital Rural Municipality', 'Bhageshwar Rural Municipality', 'Ganayapdhura Rural Municipality', 'Nawadurga Rural Municipality', 'Ajayameru Rural Municipality'] },
            { name: 'Darchula', cities: ['Mahakali Municipality', 'Shailyashikhar Municipality', 'Malikarjun Rural Municipality', 'Lekam Rural Municipality', 'Duhun Rural Municipality', 'Byas Rural Municipality', 'Marma Rural Municipality', 'Apihimal Rural Municipality', 'Naugad Rural Municipality'] },
            { name: 'Dhangadhi', cities: ['Dhangadhi Sub-Metropolitan City'] },
            { name: 'Kailali', cities: ['Tikapur Municipality', 'Lamkichuha Municipality', 'Ghodaghodi Municipality', 'Godawari Municipality', 'Gauriganga Municipality', 'Janaki Rural Municipality', 'Joshipur Rural Municipality', 'Bardagoriya Rural Municipality', 'Mohanyal Rural Municipality', 'Kailari Rural Municipality', 'Bhajani Municipality', 'Chuha Rural Municipality'] },
            { name: 'Kanchanpur', cities: ['Bhimdatta Municipality', 'Punarbas Municipality', 'Bedkot Municipality', 'Mahakali Municipality', 'Shuklaphanta Municipality', 'Krishnapur Municipality', 'Beldandi Rural Municipality', 'Laljhadi Rural Municipality', 'Belauri Municipality'] },
            { name: 'Doti', cities: ['Dipayal Silgadhi Municipality', 'Shikhar Municipality', 'Purbichauki Rural Municipality', 'Badikedar Rural Municipality', 'Jorayal Rural Municipality', 'Sayal Rural Municipality', 'Aadarsha Rural Municipality', 'K.I. Singh Rural Municipality', 'Bogatan Phudsil Rural Municipality'] },
        ],
    },
];

const provinceOrder = locationHierarchy.map((province) => province.name);

async function createLocation(name: string, type: string, parentId: number | null, details: Record<string, unknown> = {}) {
    const existing = await prisma.location.findFirst({
        where: {
            name,
            type,
            parentId,
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.location.create({
        data: {
            name,
            type,
            parentId,
            details,
        },
    });
}

async function main() {
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { username: 'neupkishor' },
        update: {
            name: 'Kishor Neupane',
            email: 'neupkishor@neupgroup.com',
            status: 'active',
            type: 'admin',
            bio: 'System Administrator',
            contact_number: '9840710507',
            profile_picture: 'https://cdn.neupgroup.com/namsari/f_697f571bf16e60.87332081.jpg',
        },
        create: {
            username: 'neupkishor',
            name: 'Kishor Neupane',
            email: 'neupkishor@neupgroup.com',
            status: 'active',
            type: 'admin',
            bio: 'System Administrator',
            contact_number: '9840710507',
            profile_picture: 'https://cdn.neupgroup.com/namsari/f_697f571bf16e60.87332081.jpg',
        },
    });

    await prisma.account.upsert({
        where: { id: 'admin-neupkishor' },
        update: {
            type: 'admin',
            provider_account_id: `user:${user.id}`,
            password_hash: passwordHash,
        },
        create: {
            id: 'admin-neupkishor',
            type: 'admin',
            provider_account_id: `user:${user.id}`,
            password_hash: passwordHash,
        },
    });

    await prisma.location.deleteMany();

    const country = await createLocation('Nepal', 'country', null, { iso: 'NP' });

    let provinceCount = 0;
    let districtCount = 0;
    let cityCount = 0;

    for (const provinceNode of locationHierarchy) {
        const province = await createLocation(provinceNode.name, 'province', country.id, { country: 'Nepal' });
        provinceCount += 1;

        for (const districtNode of provinceNode.districts) {
            const district = await createLocation(districtNode.name, 'district', province.id, {
                country: 'Nepal',
                province: provinceNode.name,
            });
            districtCount += 1;

            for (const cityName of districtNode.cities) {
                await createLocation(cityName, 'city', district.id, {
                    country: 'Nepal',
                    province: provinceNode.name,
                    district: districtNode.name,
                });
                cityCount += 1;
            }
        }
    }

    console.log('Seeded user:', user.username);
    console.log(`Seeded locations: ${provinceCount} provinces, ${districtCount} districts, ${cityCount} cities`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
