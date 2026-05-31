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
            { name: 'Kathmandu', cities: ['Kathmandu Metropolitan City', 'Kirtipur Municipality', 'Chandragiri Municipality', 'Tokha Municipality', 'Budhanilkantha Municipality', 'Nagarjun Municipality', 'Gokarneshwar Municipality', 'Dakshinkali Municipality', 'Tarakeshwar Municipality', 'Kageshwori Manohara Municipality'] },
            { name: 'Lalitpur', cities: ['Lalitpur Metropolitan City', 'Godawari Municipality', 'Mahalaxmi Municipality', 'Konjyosom Rural Municipality', 'Bagmati Rural Municipality', 'Mahankal Rural Municipality'] },
            { name: 'Bhaktapur', cities: ['Bhaktapur Municipality', 'Madhyapur Thimi Municipality', 'Suryabinayak Municipality', 'Changunarayan Municipality'] },
            { name: 'Kavrepalanchok', cities: ['Dhulikhel Municipality', 'Banepa Municipality', 'Panauti Municipality', 'Namobuddha Municipality', 'Panchkhal Municipality', 'Mandandeupur Municipality', 'Khani Khola Rural Municipality', 'Temal Rural Municipality', 'Bethanchok Rural Municipality', 'Roshi Rural Municipality', 'Mahabharat Rural Municipality', 'Chaurideurali Rural Municipality'] },
            { name: 'Sindhupalchok', cities: ['Chautara Sangachokgadhi Municipality', 'Melamchi Municipality', 'Bahrabise Municipality', 'Tripurasundari Rural Municipality', 'Lisankhu Pakhar Rural Municipality', 'Bhotekoshi Rural Municipality', 'Jugal Rural Municipality', 'Helambu Rural Municipality', 'Indrawati Rural Municipality', 'Sunkoshi Rural Municipality', 'Panchpokhari Thangpal Rural Municipality'] },
            { name: 'Dolakha', cities: ['Bhimeshwar Municipality', 'Jiri Municipality', 'Kalinchowk Rural Municipality', 'Melung Rural Municipality', 'Bigu Rural Municipality', 'Gaurishankar Rural Municipality', 'Baiteshwor Rural Municipality', 'Sailung Rural Municipality', 'Tamakoshi Rural Municipality'] },
            { name: 'Ramechhap', cities: ['Manthali Municipality', 'Ramechhap Municipality', 'Doramba Rural Municipality', 'Likhu Tamakoshi Rural Municipality', 'Sunapati Rural Municipality', 'Umakunda Rural Municipality', 'Gokulganga Rural Municipality', 'Khadadevi Rural Municipality'] },
            { name: 'Sindhuli', cities: ['Kamalamai Municipality', 'Dudhauli Municipality', 'Marin Rural Municipality', 'Sunkoshi Rural Municipality', 'Hariharpurgadhi Rural Municipality', 'Ghyanglekh Rural Municipality', 'Tinpatan Rural Municipality', 'Phikkal Rural Municipality', 'Golanjor Rural Municipality'] },
            { name: 'Makwanpur', cities: ['Hetauda Sub-Metropolitan City', 'Thaha Municipality', 'Bhimphedi Rural Municipality', 'Makawanpurgadhi Rural Municipality', 'Manahari Rural Municipality', 'Bakaiya Rural Municipality', 'Bagmati Rural Municipality', 'Raksirang Rural Municipality', 'Kailash Rural Municipality', 'Indrasarowar Rural Municipality'] },
            { name: 'Chitwan', cities: ['Bharatpur Metropolitan City', 'Ratnanagar Municipality', 'Khairahani Municipality', 'Rapti Municipality', 'Madi Municipality', 'Kalika Municipality', 'Ichchhakamana Rural Municipality'] },
            { name: 'Rasuwa', cities: ['Uttargaya Rural Municipality', 'Kalika Rural Municipality', 'Gosaikunda Rural Municipality', 'Naukunda Rural Municipality', 'Aamachhodingmo Rural Municipality'] },
            { name: 'Nuwakot', cities: ['Bidur Municipality', 'Belkotgadhi Municipality', 'Kakani Rural Municipality', 'Shivapuri Rural Municipality', 'Panchakanya Rural Municipality', 'Tadi Rural Municipality', 'Suryagadhi Rural Municipality', 'Likhu Rural Municipality', 'Kispang Rural Municipality', 'Dupcheshwar Rural Municipality', 'Tarkeshwar Rural Municipality'] },
            { name: 'Dhading', cities: ['Nilkantha Municipality', 'Dhunibesi Municipality', 'Khaniyabas Rural Municipality', 'Gajuri Rural Municipality', 'Galchhi Rural Municipality', 'Gangajamuna Rural Municipality', 'Jwalamukhi Rural Municipality', 'Thakre Rural Municipality', 'Netrawati Dabjong Rural Municipality', 'Benighat Rorang Rural Municipality', 'Ruby Valley Rural Municipality', 'Siddhalek Rural Municipality'] },
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
            { name: 'Baglung', cities: ['Baglung Municipality', 'Galkot Municipality', 'Dhorpatan Municipality', 'Jaimuni Municipality', 'Badigad Rural Municipality', 'Kathekhola Rural Municipality', 'Tamankhola Rural Municipality', 'Nisikhola Rural Municipality', 'Bareng Rural Municipality', 'Tarakhola Rural Municipality'] },
            { name: 'Gorkha', cities: ['Gorkha Municipality', 'Palungtar Municipality', 'Siranchok Rural Municipality', 'Ajirkot Rural Municipality', 'Bhimsen Thapa Rural Municipality', 'Dharche Rural Municipality', 'Chum Nubri Rural Municipality', 'Gandaki Rural Municipality', 'Shahid Lakhan Rural Municipality', 'Aarughat Rural Municipality'] },
            { name: 'Kaski', cities: ['Pokhara Metropolitan City', 'Annapurna Rural Municipality', 'Machhapuchhre Rural Municipality', 'Madi Rural Municipality', 'Rupa Rural Municipality'] },
            { name: 'Lamjung', cities: ['Besisahar Municipality', 'Madhya Nepal Municipality', 'Rainas Municipality', 'Sundarbazar Municipality', 'Marsyangdi Rural Municipality', 'Dudhpokhari Rural Municipality', 'Dordi Rural Municipality', 'Kwholasothar Rural Municipality'] },
            { name: 'Manang', cities: ['Chame Rural Municipality', 'Narpa Bhumi Rural Municipality', 'Nason Rural Municipality', 'Manang Ngisyang Rural Municipality'] },
            { name: 'Mustang', cities: ['Jomsom (Gharapjhong) Rural Municipality', 'Thasang Rural Municipality', 'Baragung Muktichhetra Rural Municipality', 'Lomanthang Rural Municipality', 'Lo-Ghekar Damodarkunda Rural Municipality'] },
            { name: 'Myagdi', cities: ['Beni Municipality', 'Annapurna Rural Municipality', 'Dhaulagiri Rural Municipality', 'Raghuganga Rural Municipality', 'Mangala Rural Municipality', 'Malika Rural Municipality', 'Dhawalagiri Rural Municipality'] },
            { name: 'Nawalpur', cities: ['Kawasoti Municipality', 'Devchuli Municipality', 'Gaindakot Municipality', 'Madhyabindu Municipality', 'Binayi Triveni Rural Municipality', 'Baudikali Rural Municipality', 'Hupsekot Rural Municipality'] },
            { name: 'Parbat', cities: ['Kushma Municipality', 'Phalebas Municipality', 'Jaljala Rural Municipality', 'Paiyun Rural Municipality', 'Modi Rural Municipality', 'Bihadi Rural Municipality', 'Mahashila Rural Municipality', 'Painyu Rural Municipality'] },
            { name: 'Syangja', cities: ['Putalibazar Municipality', 'Bhirkot Municipality', 'Waling Municipality', 'Chapakot Municipality', 'Galyang Municipality', 'Aandhikhola Rural Municipality', 'Arjun Chaupari Rural Municipality', 'Biruwa Rural Municipality', 'Harinas Rural Municipality', 'Kaligandaki Rural Municipality', 'Phedikhola Rural Municipality'] },
            { name: 'Tanahun', cities: ['Byas Municipality', 'Shuklagandaki Municipality', 'Bhanu Municipality', 'Bhimad Municipality', 'Ghiring Rural Municipality', 'Myagde Rural Municipality', 'Rhishing Rural Municipality', 'Devghat Rural Municipality', 'Bandipur Rural Municipality', 'Aanbukhaireni Rural Municipality'] },
        ],
    },
    {
        name: 'Lumbini Province',
        districts: [
            { name: 'Arghakhanchi', cities: ['Sandhikharka Municipality', 'Bhumikasthan Municipality', 'Sitganga Municipality', 'Chhatradev Rural Municipality', 'Panini Rural Municipality', 'Malarani Rural Municipality'] },
            { name: 'Banke', cities: ['Nepalgunj Sub-Metropolitan City', 'Kohalpur Municipality', 'Khajura Rural Municipality', 'Janaki Rural Municipality', 'Duduwa Rural Municipality', 'Narainapur Rural Municipality', 'Rapti Sonari Rural Municipality', 'Baijanath Rural Municipality'] },
            { name: 'Bardiya', cities: ['Gulariya Municipality', 'Rajapur Municipality', 'Madhuwan Municipality', 'Thakurbaba Municipality', 'Bansgadhi Municipality', 'Barbardiya Municipality', 'Geruwa Rural Municipality', 'Badhaiyatal Rural Municipality'] },
            { name: 'Dang', cities: ['Ghorahi Sub-Metropolitan City', 'Tulsipur Sub-Metropolitan City', 'Lamahi Municipality', 'Gadhawa Rural Municipality', 'Rajpur Rural Municipality', 'Rapti Rural Municipality', 'Shantinagar Rural Municipality', 'Banglachuli Rural Municipality', 'Dangisharan Rural Municipality', 'Babai Rural Municipality'] },
            { name: 'Eastern Rukum (Rukum East)', cities: ['Rukumkot Municipality', 'Sisne Rural Municipality', 'Bhume Rural Municipality', 'Putha Uttarganga Rural Municipality', 'Syalakhadi Area Rural Municipality'] },
            { name: 'Gulmi', cities: ['Tamghas (Resunga) Municipality', 'Musikot Municipality', 'Resunga Municipality', 'Isma Rural Municipality', 'Kaligandaki Rural Municipality', 'Gulmidarbar Rural Municipality', 'Chandrakot Rural Municipality', 'Satyawati Rural Municipality', 'Chhatrakot Rural Municipality', 'Dhurkot Rural Municipality', 'Madane Rural Municipality', 'Malika Rural Municipality'] },
            { name: 'Kapilvastu', cities: ['Kapilvastu (Taulihawa) Municipality', 'Banganga Municipality', 'Buddhabhumi Municipality', 'Shivaraj Municipality', 'Krishnanagar Municipality', 'Maharajgunj Municipality', 'Mayadevi Rural Municipality', 'Yashodhara Rural Municipality', 'Bijayanagar Rural Municipality', 'Suddhodhan Rural Municipality', 'Shuddhodhan Rural Municipality'] },
            { name: 'Nawalparasi West (West of Bardaghat Susta)', cities: ['Ramgram Municipality', 'Sunwal Municipality', 'Bardaghat Municipality', 'Sarawal Rural Municipality', 'Pratappur Rural Municipality', 'Palhinandan Rural Municipality'] },
            { name: 'Palpa', cities: ['Tansen Municipality', 'Rampur Municipality', 'Rainadevi Chhahara Rural Municipality', 'Rambha Rural Municipality', 'Mathagadhi Rural Municipality', 'Tinau Rural Municipality', 'Nisdi Rural Municipality', 'Ribdikot Rural Municipality', 'Jaldhara Rural Municipality'] },
            { name: 'Pyuthan', cities: ['Pyuthan Municipality', 'Swargadwari Municipality', 'Ayirabati Rural Municipality', 'Gaumukhi Rural Municipality', 'Mandavi Rural Municipality', 'Sarumarani Rural Municipality', 'Jhimruk Rural Municipality', 'Naubahini Rural Municipality', 'Mallarani Rural Municipality'] },
            { name: 'Rolpa', cities: ['Liwang Municipality', 'Sunil Smriti Rural Municipality', 'Runtigadhi Rural Municipality', 'Triveni Rural Municipality', 'Madi Rural Municipality', 'Sunchhahari Rural Municipality', 'Thawang Rural Municipality', 'Paribartan Rural Municipality', 'Gangadev Rural Municipality', 'Lungri Rural Municipality'] },
            { name: 'Rupandehi', cities: ['Butwal Sub-Metropolitan City', 'Siddharthanagar Municipality', 'Tilottama Municipality', 'Devdaha Municipality', 'Lumbini Sanskritik Municipality', 'Sainamaina Municipality', 'Kanchan Rural Municipality', 'Rohini Rural Municipality', 'Mayadevi Rural Municipality', 'Om Satiya Rural Municipality', 'Sammarimai Rural Municipality', 'Marchawari Rural Municipality'] },
        ],
    },
    {
        name: 'Karnali Province',
        districts: [
            { name: 'Dailekh', cities: ['Narayan Municipality', 'Dullu Municipality', 'Aathabis Municipality', 'Chamunda Bindrasaini Municipality', 'Bhagawatimai Rural Municipality', 'Mahabu Rural Municipality', 'Thantikandh Rural Municipality', 'Naumule Rural Municipality', 'Bhairabi Rural Municipality', 'Dungeshwor Rural Municipality', 'Gurans Rural Municipality'] },
            { name: 'Dolpa', cities: ['Thuli Bheri Municipality', 'Tripura Sundari Municipality', 'Shey Phoksundo Rural Municipality', 'Jagadulla Rural Municipality', 'Dolpo Buddha Rural Municipality', 'Mudkechula Rural Municipality', 'Kaike Rural Municipality', 'Chharka Tangsong Rural Municipality'] },
            { name: 'Humla', cities: ['Simikot Rural Municipality', 'Namkha Rural Municipality', 'Sarkegad Rural Municipality', 'Kharpunath Rural Municipality', 'Chankheli Rural Municipality', 'Adanchuli Rural Municipality', 'Tajakot Rural Municipality'] },
            { name: 'Jajarkot', cities: ['Bheri Municipality', 'Chhedagad Municipality', 'Nalgad Municipality', 'Barekot Rural Municipality', 'Kushe Rural Municipality', 'Junichande Rural Municipality', 'Shivalaya Rural Municipality'] },
            { name: 'Jumla', cities: ['Chandannath Municipality', 'Patarasi Rural Municipality', 'Guthichaur Rural Municipality', 'Tatopani Rural Municipality', 'Tila Rural Municipality', 'Hima Rural Municipality', 'Sinja Rural Municipality', 'Kanakasundari Rural Municipality'] },
            { name: 'Kalikot', cities: ['Khandachakra Municipality', 'Raskot Municipality', 'Tilagupha Municipality', 'Pachaljharana Rural Municipality', 'Sanni Triveni Rural Municipality', 'Narharinath Rural Municipality', 'Shubha Kalika Rural Municipality', 'Mahawai Rural Municipality', 'Palata Rural Municipality'] },
            { name: 'Mugu', cities: ['Chhayanath Rara Municipality', 'Soru Rural Municipality', 'Khatyad Rural Municipality', 'Mugu Karmarong Rural Municipality'] },
            { name: 'Salyan', cities: ['Sharada Municipality', 'Bangad Kupinde Municipality', 'Bagchaur Municipality', 'Siddha Kumakh Rural Municipality', 'Kumakh Rural Municipality', 'Kalimati Rural Municipality', 'Chhatreshwari Rural Municipality', 'Tribeni Rural Municipality', 'Kapurkot Rural Municipality', 'Darma Rural Municipality'] },
            { name: 'Surkhet', cities: ['Birendranagar Sub-Metropolitan City', 'Gurbhakot Municipality', 'Bheriganga Municipality', 'Panchapuri Municipality', 'Lekbeshi Municipality', 'Barahatal Rural Municipality', 'Chaukune Rural Municipality', 'Simta Rural Municipality', 'Chingad Rural Municipality'] },
            { name: 'Western Rukum (Rukum West)', cities: ['Musikot Municipality', 'Chaurjahari Municipality', 'Aathbiskot Municipality', 'Sanibheri Rural Municipality', 'Banfikot Rural Municipality', 'Tribeni Rural Municipality'] },
        ],
    },
    {
        name: 'Sudurpashchim Province',
        districts: [
            { name: 'Achham', cities: ['Mangalsen Municipality', 'Kamalbazar Municipality', 'Sanphebagar Municipality', 'Panchadewal Binayak Municipality', 'Bannigadhi Jayagadh Rural Municipality', 'Chaurpati Rural Municipality', 'Turmakhand Rural Municipality', 'Mellekh Rural Municipality', 'Dhakari Rural Municipality', 'Ramaroshan Rural Municipality'] },
            { name: 'Baitadi', cities: ['Dasharathchand Municipality', 'Patan Municipality', 'Melauli Municipality', 'Purchaudi Municipality', 'Pancheshwar Rural Municipality', 'Sigas Rural Municipality', 'Shivanath Rural Municipality', 'Dogdakedar Rural Municipality', 'Dilasaini Rural Municipality', 'Sunarya Rural Municipality', 'Surnaya Rural Municipality'] },
            { name: 'Bajhang', cities: ['Jaya Prithvi Municipality', 'Bungal Municipality', 'Kedarsyu Rural Municipality', 'Saipal Rural Municipality', 'Talkot Rural Municipality', 'Thalara Rural Municipality', 'Masta Rural Municipality', 'Chhabis Pathibhara Rural Municipality', 'Khaptadchhanna Rural Municipality', 'Surma Rural Municipality', 'Durgathali Rural Municipality', 'Bitthadchir Rural Municipality'] },
            { name: 'Bajura', cities: ['Budhinanda Municipality', 'Triveni Municipality', 'Badimalika Municipality', 'Khaptad Chhededaha Rural Municipality', 'Swamikartik Khapar Rural Municipality', 'Jagannath Rural Municipality', 'Gaumul Rural Municipality', 'Himali Rural Municipality', 'Budhiganga Municipality'] },
            { name: 'Dadeldhura', cities: ['Amargadhi Municipality', 'Parshuram Municipality', 'Aalingar Rural Municipality', 'Ajaymeru Rural Municipality', 'Bhageshwar Rural Municipality', 'Ganyapdhura Rural Municipality', 'Nawadurga Rural Municipality'] },
            { name: 'Darchula', cities: ['Mahakali Municipality', 'Shailyashikhar Municipality', 'Malikarjun Rural Municipality', 'Apihimal Rural Municipality', 'Duhun Rural Municipality', 'Naugad Rural Municipality', 'Marma Rural Municipality', 'Lekam Rural Municipality', 'Byas Rural Municipality'] },
            { name: 'Kailali', cities: ['Dhangadhi Sub-Metropolitan City', 'Tikapur Municipality', 'Lamki-Chuha Municipality', 'Bhajani Municipality', 'Ghodaghodi Municipality', 'Godawari Municipality', 'Janaki Rural Municipality', 'Joshipur Rural Municipality', 'Bardagoriya Rural Municipality', 'Mohanyal Rural Municipality', 'Kailari Rural Municipality', 'Chure Rural Municipality'] },
            { name: 'Kanchanpur', cities: ['Bhimdatta Municipality', 'Bedkot Municipality', 'Shuklaphanta Municipality', 'Belauri Municipality', 'Punarbas Municipality', 'Krishnapur Municipality', 'Laljhadi Rural Municipality', 'Beldandi Rural Municipality'] },
            { name: 'Doti', cities: ['Dipayal Silgadhi Municipality', 'Shikhar Municipality', 'Purbichauki Rural Municipality', 'Jorayal Rural Municipality', 'Adarsha Rural Municipality', 'Badikedar Rural Municipality', 'Sayal Rural Municipality', 'Bogatan Phudsil Rural Municipality', 'Kimdada Rural Municipality'] },
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
