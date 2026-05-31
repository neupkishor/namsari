"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui';
import {
    FormGrid,
    FormLabel,
    GeoLocationInput
} from '@/components/form';

interface LocationInformationProps {
    unlocked: boolean;
    onComplete: () => void;
    province: string;
    setProvince: (val: string) => void;
    // Location source & Coords
    locationSource: string;
    handleLocationSourceChange: (val: string) => void;
    fetchCoordinates: () => void;
    fetchingCoords: boolean;
    coords: { lat: string; lng: string };
    setCoords: (coords: { lat: string; lng: string }) => void;
    setLocationSource: (val: string) => void;
    // District, City, Area
    district: string;
    setDistrict: (val: string) => void;
    cityVillage: string;
    setCityVillage: (val: string) => void;
    area: string;
    setArea: (val: string) => void;
    // Ward & Landmark
    ward: string;
    setWard: (val: string) => void;
    landmark: string;
    setLandmark: (val: string) => void;
    // Errors
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const ALL_DISTRICTS = [
    "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur",
    "Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha",
    "Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok",
    "Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur (East Nawalparasi)", "Parbat", "Syangja", "Tanahun",
    "Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Palpa", "Pyuthan", "Rolpa", "Rupandehi", "Eastern Rukum (Rukum East)", "Nawalparasi West (West of Bardaghat Susta)",
    "Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Salyan", "Surkhet", "Western Rukum (Rukum West)",
    "Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"
];

const PROVINCES = [
    "Koshi",
    "Madhesh",
    "Bagmati",
    "Gandaki",
    "Lumbini",
    "Karnali",
    "Sudurpashchim"
];

const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
    Koshi: ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
    Madhesh: ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
    Bagmati: ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
    Gandaki: ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur (East Nawalparasi)", "Parbat", "Syangja", "Tanahun"],
    Lumbini: ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Palpa", "Pyuthan", "Rolpa", "Rupandehi", "Eastern Rukum (Rukum East)", "Nawalparasi West (West of Bardaghat Susta)"],
    Karnali: ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Salyan", "Surkhet", "Western Rukum (Rukum West)"],
    Sudurpashchim: ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
};

const CITY_VILLAGES_BY_DISTRICT: Record<string, string[]> = {
    Arghakhanchi: ["Sandhikharka Municipality", "Bhumikasthan Municipality", "Sitganga Municipality", "Chhatradev Rural Municipality", "Panini Rural Municipality", "Malarani Rural Municipality"],
    Banke: ["Nepalgunj Sub-Metropolitan City", "Kohalpur Municipality", "Khajura Rural Municipality", "Janaki Rural Municipality", "Duduwa Rural Municipality", "Narainapur Rural Municipality", "Rapti Sonari Rural Municipality", "Baijanath Rural Municipality"],
    Bardiya: ["Gulariya Municipality", "Rajapur Municipality", "Madhuwan Municipality", "Thakurbaba Municipality", "Bansgadhi Municipality", "Barbardiya Municipality", "Geruwa Rural Municipality", "Badhaiyatal Rural Municipality"],
    Dang: ["Ghorahi Sub-Metropolitan City", "Tulsipur Sub-Metropolitan City", "Lamahi Municipality", "Gadhawa Rural Municipality", "Rajpur Rural Municipality", "Rapti Rural Municipality", "Shantinagar Rural Municipality", "Banglachuli Rural Municipality", "Dangisharan Rural Municipality", "Babai Rural Municipality"],
    Gulmi: ["Tamghas (Resunga) Municipality", "Musikot Municipality", "Resunga Municipality", "Isma Rural Municipality", "Kaligandaki Rural Municipality", "Gulmidarbar Rural Municipality", "Chandrakot Rural Municipality", "Satyawati Rural Municipality", "Chhatrakot Rural Municipality", "Dhurkot Rural Municipality", "Madane Rural Municipality", "Malika Rural Municipality"],
    Kapilvastu: ["Kapilvastu (Taulihawa) Municipality", "Banganga Municipality", "Buddhabhumi Municipality", "Shivaraj Municipality", "Krishnanagar Municipality", "Maharajgunj Municipality", "Mayadevi Rural Municipality", "Yashodhara Rural Municipality", "Bijayanagar Rural Municipality", "Suddhodhan Rural Municipality", "Shuddhodhan Rural Municipality"],
    Rupandehi: ["Butwal Sub-Metropolitan City", "Siddharthanagar Municipality", "Tilottama Municipality", "Devdaha Municipality", "Lumbini Sanskritik Municipality", "Sainamaina Municipality", "Kanchan Rural Municipality", "Rohini Rural Municipality", "Mayadevi Rural Municipality", "Om Satiya Rural Municipality", "Sammarimai Rural Municipality", "Marchawari Rural Municipality"],
    "Nawalparasi West": ["Ramgram Municipality", "Sunwal Municipality", "Bardaghat Municipality", "Sarawal Rural Municipality", "Pratappur Rural Municipality", "Palhinandan Rural Municipality"],
    "Nawalparasi West (West of Bardaghat Susta)": ["Ramgram Municipality", "Sunwal Municipality", "Bardaghat Municipality", "Sarawal Rural Municipality", "Pratappur Rural Municipality", "Palhinandan Rural Municipality"],
    Parasi: ["Ramgram Municipality", "Sunwal Municipality", "Bardaghat Municipality", "Sarawal Rural Municipality", "Pratappur Rural Municipality", "Palhinandan Rural Municipality"],
    Palpa: ["Tansen Municipality", "Rampur Municipality", "Rainadevi Chhahara Rural Municipality", "Rambha Rural Municipality", "Mathagadhi Rural Municipality", "Tinau Rural Municipality", "Nisdi Rural Municipality", "Ribdikot Rural Municipality", "Jaldhara Rural Municipality"],
    Pyuthan: ["Pyuthan Municipality", "Swargadwari Municipality", "Ayirabati Rural Municipality", "Gaumukhi Rural Municipality", "Mandavi Rural Municipality", "Sarumarani Rural Municipality", "Jhimruk Rural Municipality", "Naubahini Rural Municipality", "Mallarani Rural Municipality"],
    Rolpa: ["Liwang Municipality", "Sunil Smriti Rural Municipality", "Runtigadhi Rural Municipality", "Triveni Rural Municipality", "Madi Rural Municipality", "Sunchhahari Rural Municipality", "Thawang Rural Municipality", "Paribartan Rural Municipality", "Gangadev Rural Municipality", "Lungri Rural Municipality"],
    "Eastern Rukum": ["Rukumkot Municipality", "Sisne Rural Municipality", "Bhume Rural Municipality", "Putha Uttarganga Rural Municipality", "Syalakhadi Area Rural Municipality"],
    "Eastern Rukum (Rukum East)": ["Rukumkot Municipality", "Sisne Rural Municipality", "Bhume Rural Municipality", "Putha Uttarganga Rural Municipality", "Syalakhadi Area Rural Municipality"],
    "Rukum East": ["Rukumkot Municipality", "Sisne Rural Municipality", "Bhume Rural Municipality", "Putha Uttarganga Rural Municipality", "Syalakhadi Area Rural Municipality"],
    Surkhet: ["Birendranagar Sub-Metropolitan City", "Gurbhakot Municipality", "Bheriganga Municipality", "Panchapuri Municipality", "Lekbeshi Municipality", "Barahatal Rural Municipality", "Chaukune Rural Municipality", "Simta Rural Municipality", "Chingad Rural Municipality"],
    Dailekh: ["Narayan Municipality", "Dullu Municipality", "Aathabis Municipality", "Chamunda Bindrasaini Municipality", "Bhagawatimai Rural Municipality", "Mahabu Rural Municipality", "Thantikandh Rural Municipality", "Naumule Rural Municipality", "Bhairabi Rural Municipality", "Dungeshwor Rural Municipality", "Gurans Rural Municipality"],
    Jajarkot: ["Bheri Municipality", "Chhedagad Municipality", "Nalgad Municipality", "Barekot Rural Municipality", "Kushe Rural Municipality", "Junichande Rural Municipality", "Shivalaya Rural Municipality"],
    Salyan: ["Sharada Municipality", "Bangad Kupinde Municipality", "Bagchaur Municipality", "Siddha Kumakh Rural Municipality", "Kumakh Rural Municipality", "Kalimati Rural Municipality", "Chhatreshwari Rural Municipality", "Tribeni Rural Municipality", "Kapurkot Rural Municipality", "Darma Rural Municipality"],
    "Rukum West": ["Musikot Municipality", "Chaurjahari Municipality", "Aathbiskot Municipality", "Sanibheri Rural Municipality", "Banfikot Rural Municipality", "Tribeni Rural Municipality"],
    "Western Rukum": ["Musikot Municipality", "Chaurjahari Municipality", "Aathbiskot Municipality", "Sanibheri Rural Municipality", "Banfikot Rural Municipality", "Tribeni Rural Municipality"],
    "Western Rukum (Rukum West)": ["Musikot Municipality", "Chaurjahari Municipality", "Aathbiskot Municipality", "Sanibheri Rural Municipality", "Banfikot Rural Municipality", "Tribeni Rural Municipality"],
    Dolpa: ["Thuli Bheri Municipality", "Tripura Sundari Municipality", "Shey Phoksundo Rural Municipality", "Jagadulla Rural Municipality", "Dolpo Buddha Rural Municipality", "Mudkechula Rural Municipality", "Kaike Rural Municipality", "Chharka Tangsong Rural Municipality"],
    Jumla: ["Chandannath Municipality", "Patarasi Rural Municipality", "Guthichaur Rural Municipality", "Tatopani Rural Municipality", "Tila Rural Municipality", "Hima Rural Municipality", "Sinja Rural Municipality", "Kanakasundari Rural Municipality"],
    Kalikot: ["Khandachakra Municipality", "Raskot Municipality", "Tilagupha Municipality", "Pachaljharana Rural Municipality", "Sanni Triveni Rural Municipality", "Narharinath Rural Municipality", "Shubha Kalika Rural Municipality", "Mahawai Rural Municipality", "Palata Rural Municipality"],
    Mugu: ["Chhayanath Rara Municipality", "Soru Rural Municipality", "Khatyad Rural Municipality", "Mugu Karmarong Rural Municipality"],
    Humla: ["Simikot Rural Municipality", "Namkha Rural Municipality", "Sarkegad Rural Municipality", "Kharpunath Rural Municipality", "Chankheli Rural Municipality", "Adanchuli Rural Municipality", "Tajakot Rural Municipality"],
    Kailali: ["Dhangadhi Sub-Metropolitan City", "Tikapur Municipality", "Lamki-Chuha Municipality", "Bhajani Municipality", "Ghodaghodi Municipality", "Godawari Municipality", "Janaki Rural Municipality", "Joshipur Rural Municipality", "Bardagoriya Rural Municipality", "Mohanyal Rural Municipality", "Kailari Rural Municipality", "Chure Rural Municipality"],
    Kanchanpur: ["Bhimdatta Municipality", "Bedkot Municipality", "Shuklaphanta Municipality", "Belauri Municipality", "Punarbas Municipality", "Krishnapur Municipality", "Laljhadi Rural Municipality", "Beldandi Rural Municipality"],
    Dadeldhura: ["Amargadhi Municipality", "Parshuram Municipality", "Aalingar Rural Municipality", "Ajaymeru Rural Municipality", "Bhageshwar Rural Municipality", "Ganyapdhura Rural Municipality", "Nawadurga Rural Municipality"],
    Baitadi: ["Dasharathchand Municipality", "Patan Municipality", "Melauli Municipality", "Purchaudi Municipality", "Pancheshwar Rural Municipality", "Sigas Rural Municipality", "Shivanath Rural Municipality", "Dogdakedar Rural Municipality", "Dilasaini Rural Municipality", "Sunarya Rural Municipality", "Surnaya Rural Municipality"],
    Doti: ["Dipayal Silgadhi Municipality", "Shikhar Municipality", "Purbichauki Rural Municipality", "Jorayal Rural Municipality", "Adarsha Rural Municipality", "Badikedar Rural Municipality", "Sayal Rural Municipality", "Bogatan Phudsil Rural Municipality", "Kimdada Rural Municipality"],
    Achham: ["Mangalsen Municipality", "Kamalbazar Municipality", "Sanphebagar Municipality", "Panchadewal Binayak Municipality", "Bannigadhi Jayagadh Rural Municipality", "Chaurpati Rural Municipality", "Turmakhand Rural Municipality", "Mellekh Rural Municipality", "Dhakari Rural Municipality", "Ramaroshan Rural Municipality"],
    Bajura: ["Budhinanda Municipality", "Triveni Municipality", "Badimalika Municipality", "Khaptad Chhededaha Rural Municipality", "Swamikartik Khapar Rural Municipality", "Jagannath Rural Municipality", "Gaumul Rural Municipality", "Himali Rural Municipality", "Budhiganga Municipality"],
    Bajhang: ["Jaya Prithvi Municipality", "Bungal Municipality", "Kedarsyu Rural Municipality", "Saipal Rural Municipality", "Talkot Rural Municipality", "Thalara Rural Municipality", "Masta Rural Municipality", "Chhabis Pathibhara Rural Municipality", "Khaptadchhanna Rural Municipality", "Surma Rural Municipality", "Durgathali Rural Municipality", "Bitthadchir Rural Municipality"],
    Darchula: ["Mahakali Municipality", "Shailyashikhar Municipality", "Malikarjun Rural Municipality", "Apihimal Rural Municipality", "Duhun Rural Municipality", "Naugad Rural Municipality", "Marma Rural Municipality", "Lekam Rural Municipality", "Byas Rural Municipality"],
    Kaski: ["Pokhara Metropolitan City", "Annapurna Rural Municipality", "Machhapuchhre Rural Municipality", "Madi Rural Municipality", "Rupa Rural Municipality"],
    Tanahun: ["Byas Municipality", "Shuklagandaki Municipality", "Bhanu Municipality", "Bhimad Municipality", "Ghiring Rural Municipality", "Myagde Rural Municipality", "Rhishing Rural Municipality", "Devghat Rural Municipality", "Bandipur Rural Municipality", "Aanbukhaireni Rural Municipality"],
    Lamjung: ["Besisahar Municipality", "Madhya Nepal Municipality", "Rainas Municipality", "Sundarbazar Municipality", "Marsyangdi Rural Municipality", "Dudhpokhari Rural Municipality", "Dordi Rural Municipality", "Kwholasothar Rural Municipality"],
    Gorkha: ["Gorkha Municipality", "Palungtar Municipality", "Siranchok Rural Municipality", "Ajirkot Rural Municipality", "Bhimsen Thapa Rural Municipality", "Dharche Rural Municipality", "Chum Nubri Rural Municipality", "Gandaki Rural Municipality", "Shahid Lakhan Rural Municipality", "Aarughat Rural Municipality"],
    Syangja: ["Putalibazar Municipality", "Bhirkot Municipality", "Waling Municipality", "Chapakot Municipality", "Galyang Municipality", "Aandhikhola Rural Municipality", "Arjun Chaupari Rural Municipality", "Biruwa Rural Municipality", "Harinas Rural Municipality", "Kaligandaki Rural Municipality", "Phedikhola Rural Municipality"],
    Parbat: ["Kushma Municipality", "Phalebas Municipality", "Jaljala Rural Municipality", "Paiyun Rural Municipality", "Modi Rural Municipality", "Bihadi Rural Municipality", "Mahashila Rural Municipality", "Painyu Rural Municipality"],
    Baglung: ["Baglung Municipality", "Galkot Municipality", "Dhorpatan Municipality", "Jaimuni Municipality", "Badigad Rural Municipality", "Kathekhola Rural Municipality", "Tamankhola Rural Municipality", "Nisikhola Rural Municipality", "Bareng Rural Municipality", "Tarakhola Rural Municipality"],
    Myagdi: ["Beni Municipality", "Annapurna Rural Municipality", "Dhaulagiri Rural Municipality", "Raghuganga Rural Municipality", "Mangala Rural Municipality", "Malika Rural Municipality", "Dhawalagiri Rural Municipality"],
    Mustang: ["Jomsom (Gharapjhong) Rural Municipality", "Thasang Rural Municipality", "Baragung Muktichhetra Rural Municipality", "Lomanthang Rural Municipality", "Lo-Ghekar Damodarkunda Rural Municipality"],
    Manang: ["Chame Rural Municipality", "Narpa Bhumi Rural Municipality", "Nason Rural Municipality", "Manang Ngisyang Rural Municipality"],
    Nawalpur: ["Kawasoti Municipality", "Devchuli Municipality", "Gaindakot Municipality", "Madhyabindu Municipality", "Binayi Triveni Rural Municipality", "Baudikali Rural Municipality", "Hupsekot Rural Municipality"],
    "Nawalpur (East Nawalparasi)": ["Kawasoti Municipality", "Devchuli Municipality", "Gaindakot Municipality", "Madhyabindu Municipality", "Binayi Triveni Rural Municipality", "Baudikali Rural Municipality", "Hupsekot Rural Municipality"],
    Kathmandu: ["Kathmandu Metropolitan City", "Kirtipur Municipality", "Chandragiri Municipality", "Tokha Municipality", "Budhanilkantha Municipality", "Nagarjun Municipality", "Gokarneshwar Municipality", "Dakshinkali Municipality", "Tarakeshwar Municipality", "Kageshwori Manohara Municipality"],
    Lalitpur: ["Lalitpur Metropolitan City", "Godawari Municipality", "Mahalaxmi Municipality", "Konjyosom Rural Municipality", "Bagmati Rural Municipality", "Mahankal Rural Municipality"],
    Bhaktapur: ["Bhaktapur Municipality", "Madhyapur Thimi Municipality", "Suryabinayak Municipality", "Changunarayan Municipality"],
    Kavrepalanchok: ["Dhulikhel Municipality", "Banepa Municipality", "Panauti Municipality", "Namobuddha Municipality", "Panchkhal Municipality", "Mandandeupur Municipality", "Khani Khola Rural Municipality", "Temal Rural Municipality", "Bethanchok Rural Municipality", "Roshi Rural Municipality", "Mahabharat Rural Municipality", "Chaurideurali Rural Municipality"],
    Sindhupalchok: ["Chautara Sangachokgadhi Municipality", "Melamchi Municipality", "Bahrabise Municipality", "Tripurasundari Rural Municipality", "Lisankhu Pakhar Rural Municipality", "Bhotekoshi Rural Municipality", "Jugal Rural Municipality", "Helambu Rural Municipality", "Indrawati Rural Municipality", "Sunkoshi Rural Municipality", "Panchpokhari Thangpal Rural Municipality"],
    Dolakha: ["Bhimeshwar Municipality", "Jiri Municipality", "Kalinchowk Rural Municipality", "Melung Rural Municipality", "Bigu Rural Municipality", "Gaurishankar Rural Municipality", "Baiteshwor Rural Municipality", "Sailung Rural Municipality", "Tamakoshi Rural Municipality"],
    Ramechhap: ["Manthali Municipality", "Ramechhap Municipality", "Doramba Rural Municipality", "Likhu Tamakoshi Rural Municipality", "Sunapati Rural Municipality", "Umakunda Rural Municipality", "Gokulganga Rural Municipality", "Khadadevi Rural Municipality"],
    Sindhuli: ["Kamalamai Municipality", "Dudhauli Municipality", "Marin Rural Municipality", "Sunkoshi Rural Municipality", "Hariharpurgadhi Rural Municipality", "Ghyanglekh Rural Municipality", "Tinpatan Rural Municipality", "Phikkal Rural Municipality", "Golanjor Rural Municipality"],
    Makwanpur: ["Hetauda Sub-Metropolitan City", "Thaha Municipality", "Bhimphedi Rural Municipality", "Makawanpurgadhi Rural Municipality", "Manahari Rural Municipality", "Bakaiya Rural Municipality", "Bagmati Rural Municipality", "Raksirang Rural Municipality", "Kailash Rural Municipality", "Indrasarowar Rural Municipality"],
    Chitwan: ["Bharatpur Metropolitan City", "Ratnanagar Municipality", "Khairahani Municipality", "Rapti Municipality", "Madi Municipality", "Kalika Municipality", "Ichchhakamana Rural Municipality"],
    Nuwakot: ["Bidur Municipality", "Belkotgadhi Municipality", "Kakani Rural Municipality", "Shivapuri Rural Municipality", "Panchakanya Rural Municipality", "Tadi Rural Municipality", "Suryagadhi Rural Municipality", "Likhu Rural Municipality", "Kispang Rural Municipality", "Dupcheshwar Rural Municipality", "Tarkeshwar Rural Municipality"],
    Dhading: ["Nilkantha Municipality", "Dhunibesi Municipality", "Khaniyabas Rural Municipality", "Gajuri Rural Municipality", "Galchhi Rural Municipality", "Gangajamuna Rural Municipality", "Jwalamukhi Rural Municipality", "Thakre Rural Municipality", "Netrawati Dabjong Rural Municipality", "Benighat Rorang Rural Municipality", "Ruby Valley Rural Municipality", "Siddhalek Rural Municipality"],
    Bhojpur: ["Bhojpur Municipality", "Shadananda Municipality", "Hatuwagadhi Rural Municipality", "Ramprasad Rai Rural Municipality", "Aamchowk Rural Municipality", "Tyamke Maiyum Rural Municipality", "Salpasilichho Rural Municipality", "Pauwadungma Rural Municipality", "Arun Rural Municipality"],
    Dhankuta: ["Dhankuta Municipality", "Pakhribas Municipality", "Mahalaxmi Municipality", "Chhathar Jorpati Rural Municipality", "Sangurigadhi Rural Municipality", "Sahidbhumi Rural Municipality", "Chaubise Rural Municipality"],
    Ilam: ["Ilam Municipality", "Deumai Municipality", "Mai Municipality", "Suryodaya Municipality", "Mai Jogmai Rural Municipality", "Sandakpur Rural Municipality", "Mangsebung Rural Municipality", "Chulachuli Rural Municipality", "Rong Rural Municipality", "Fakfokthum Rural Municipality", "Miklajung Rural Municipality"],
    Jhapa: ["Birtamod Municipality", "Damak Municipality", "Mechinagar Municipality", "Bhadrapur Municipality", "Arjundhara Municipality", "Kankai Municipality", "Gauradaha Municipality", "Shivasatakshi Municipality", "Buddhashanti Rural Municipality", "Kachankawal Rural Municipality", "Barhadashi Rural Municipality", "Jhapa Rural Municipality", "Gauriganj Rural Municipality", "Haldibari Rural Municipality"],
    Morang: ["Biratnagar Metropolitan City", "Sundarharaicha Municipality", "Belbari Municipality", "Pathari-Shanishchare Municipality", "Rangeli Municipality", "Urlabari Municipality", "Letang Municipality", "Budhiganga Rural Municipality", "Kanepokhari Rural Municipality", "Miklajung Rural Municipality", "Kerabari Rural Municipality", "Jahada Rural Municipality", "Dhanpalthan Rural Municipality", "Gramthan Rural Municipality", "Katahari Rural Municipality", "Sunwarshi Rural Municipality"],
    Sunsari: ["Dharan Sub-Metropolitan City", "Itahari Sub-Metropolitan City", "Inaruwa Municipality", "Duhabi Municipality", "Ramdhuni Municipality", "Barahachhetra Municipality", "Koshi Rural Municipality", "Bhokraha Narsingh Rural Municipality", "Gadhi Rural Municipality", "Dewanganj Rural Municipality", "Harinagara Rural Municipality", "Barju Rural Municipality"],
    Udayapur: ["Triyuga Municipality", "Chaudandigadhi Municipality", "Katari Municipality", "Belaka Municipality", "Udayapurgadhi Rural Municipality", "Rautamai Rural Municipality", "Tapli Rural Municipality", "Limchungbung Rural Municipality"],
    Okhaldhunga: ["Siddhicharan Municipality", "Khiji Demba Rural Municipality", "Chishankhugadhi Rural Municipality", "Molung Rural Municipality", "Manebhanjyang Rural Municipality", "Sunkoshi Rural Municipality", "Likhu Rural Municipality", "Champadevi Rural Municipality"],
    Khotang: ["Diktel Rupakot Majhuwagadhi Municipality", "Halesi Tuwachung Municipality", "Kepilasgadhi Rural Municipality", "Aiselukharka Rural Municipality", "Rawa Besi Rural Municipality", "Sakela Rural Municipality", "Barahapokhari Rural Municipality", "Diprung Rural Municipality", "Jantedhunga Rural Municipality", "Khotehang Rural Municipality"],
    Solukhumbu: ["Solududhkunda Municipality", "Khumbu Pasanglhamu Rural Municipality", "Mahakulung Rural Municipality", "Nechasalyan Rural Municipality", "Thulung Dudhkoshi Rural Municipality", "Mapya Dudhkoshi Rural Municipality", "Likhu Pike Rural Municipality"],
    Sankhuwasabha: ["Khandbari Municipality", "Chainpur Municipality", "Madi Municipality", "Bhotkhola Rural Municipality", "Makalu Rural Municipality", "Silichong Rural Municipality", "Chichila Rural Municipality", "Sabhapokhari Rural Municipality", "Tumlingtar"],
    Terhathum: ["Myanglung Municipality", "Laligurans Municipality", "Aathrai Rural Municipality", "Chhathar Rural Municipality", "Phedap Rural Municipality", "Menchayam Rural Municipality"],
    Tehrathum: ["Myanglung Municipality", "Laligurans Municipality", "Aathrai Rural Municipality", "Chhathar Rural Municipality", "Phedap Rural Municipality", "Menchayam Rural Municipality"],
    Taplejung: ["Phungling Municipality", "Pathibhara Yangwarak Rural Municipality", "Sirijangha Rural Municipality", "Mikwakhola Rural Municipality", "Phaktanglung Rural Municipality", "Aathrai Tribeni Rural Municipality", "Sidingba Rural Municipality", "Maiwakhola Rural Municipality"]
};

const mergeUnique = (...groups: string[][]) => {
    const seen = new Set<string>();
    return groups.flat().filter(item => {
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const toAdministrativeAreaName = (locationName: string) => {
    return locationName
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s+(Metropolitan City|Sub-Metropolitan City|Municipality|Rural Municipality)$/i, '')
        .trim();
};

const withAdministrativeAreaOptions = (locations: string[]) => {
    return mergeUnique(locations, locations.map(toAdministrativeAreaName).filter(Boolean));
};

const allFallbackCityVillages = () => {
    return Object.values(CITY_VILLAGES_BY_DISTRICT).flat();
};

type LocationRow = {
    id: number;
    name: string;
    type: string;
    parentId: number | null;
};

export const LocationInformation: React.FC<LocationInformationProps> = ({
    unlocked,
    onComplete,
    province,
    setProvince,
    locationSource,
    handleLocationSourceChange,
    fetchCoordinates,
    fetchingCoords,
    coords,
    setCoords,
    setLocationSource,
    district,
    setDistrict,
    cityVillage,
    setCityVillage,
    area,
    setArea,
    ward,
    setWard,
    landmark,
    setLandmark,
    errors,
    setErrors
}) => {
    const [locationRows, setLocationRows] = useState<LocationRow[]>([]);
    const [locationLoadError, setLocationLoadError] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadLocations = async () => {
            try {
                const response = await fetch('/api/locations');
                if (!response.ok) {
                    throw new Error('Unable to load locations');
                }
                const data = await response.json();
                if (mounted) {
                    setLocationRows(Array.isArray(data.locations) ? data.locations : []);
                    setLocationLoadError('');
                }
            } catch (error) {
                if (mounted) {
                    setLocationRows([]);
                    setLocationLoadError('Unable to load location suggestions.');
                }
            }
        };

        loadLocations();

        return () => {
            mounted = false;
        };
    }, []);

    const provinceList = useMemo(() => {
        const apiProvinces = locationRows.filter(item => item.type === 'province').map(item => item.name);
        return apiProvinces.length > 0 ? apiProvinces : PROVINCES;
    }, [locationRows]);

    const districtList = useMemo(() => {
        const apiDistricts = locationRows.filter(item => item.type === 'district').map(item => item.name);
        return apiDistricts.length > 0 ? apiDistricts : ALL_DISTRICTS;
    }, [locationRows]);

    const cityList = useMemo(() => {
        const apiCities = locationRows.filter(item => item.type === 'city').map(item => item.name);
        return apiCities;
    }, [locationRows]);

    const locationById = useMemo(() => {
        return new Map(locationRows.map(item => [item.id, item] as const));
    }, [locationRows]);

    const selectedProvinceRow = useMemo(() => {
        const normalizedProvince = province.trim().toLowerCase();
        if (!normalizedProvince) return undefined;
        return locationRows.find(item => item.type === 'province' && item.name.toLowerCase() === normalizedProvince);
    }, [locationRows, province]);

    const selectedDistrictRow = useMemo(() => {
        const normalizedDistrict = district.trim().toLowerCase();
        if (!normalizedDistrict) return undefined;
        return locationRows.find(item => item.type === 'district' && item.name.toLowerCase() === normalizedDistrict);
    }, [district, locationRows]);

    const selectedProvinceName = selectedProvinceRow?.name || provinceList.find(p => p.toLowerCase() === province.trim().toLowerCase()) || '';
    const selectedDistrictName = selectedDistrictRow?.name || districtList.find(d => d.toLowerCase() === district.trim().toLowerCase()) || '';
    const normalizedDistrictMap = useMemo(() => {
        const map = new Map<string, string>();
        districtList.forEach(districtName => {
            const match = locationRows.find(item => item.type === 'district' && item.name.toLowerCase() === districtName.toLowerCase());
            if (match?.parentId) {
                const parent = locationById.get(match.parentId);
                if (parent?.name) {
                    map.set(districtName.toLowerCase(), parent.name);
                }
            }
        });
        Object.entries(DISTRICTS_BY_PROVINCE).forEach(([provinceName, districts]) => {
            districts.forEach(districtName => {
                if (!map.has(districtName.toLowerCase())) {
                    map.set(districtName.toLowerCase(), provinceName);
                }
            });
        });
        return map;
    }, [districtList, locationById, locationRows]);

    const normalizedCityMap = useMemo(() => {
        const map = new Map<string, { district: string; province: string }>();
        cityList.forEach(cityName => {
            const match = locationRows.find(item => item.type === 'city' && item.name.toLowerCase() === cityName.toLowerCase());
            const districtRow = match?.parentId ? locationById.get(match.parentId) : undefined;
            const provinceRow = districtRow?.parentId ? locationById.get(districtRow.parentId) : undefined;
            if (districtRow?.name && provinceRow?.name) {
                map.set(cityName.toLowerCase(), { district: districtRow.name, province: provinceRow.name });
            }
        });
        Object.entries(CITY_VILLAGES_BY_DISTRICT).forEach(([districtName, cityNames]) => {
            const provinceName = normalizedDistrictMap.get(districtName.toLowerCase());
            if (!provinceName) return;
            withAdministrativeAreaOptions(cityNames).forEach(cityName => {
                if (!map.has(cityName.toLowerCase())) {
                    map.set(cityName.toLowerCase(), { district: districtName, province: provinceName });
                }
            });
        });
        return map;
    }, [cityList, locationById, locationRows, normalizedDistrictMap]);

    const filteredProvinces = province
        ? provinceList.filter(p => p.toLowerCase().includes(province.toLowerCase()))
        : provinceList;

    const districtOptions = useMemo(() => {
        if (selectedProvinceRow) {
            const apiDistricts = locationRows
                .filter(item => item.type === 'district' && item.parentId === selectedProvinceRow.id)
                .map(item => item.name);
            if (apiDistricts.length > 0) return apiDistricts;
        }

        if (selectedProvinceName && DISTRICTS_BY_PROVINCE[selectedProvinceName]) {
            return DISTRICTS_BY_PROVINCE[selectedProvinceName];
        }

        return districtList;
    }, [districtList, locationRows, selectedProvinceName, selectedProvinceRow]);

    const filteredDistricts = district
        ? districtOptions.filter(d => d.toLowerCase().includes(district.toLowerCase()))
        : districtOptions;

    const cityOptions = useMemo(() => {
        if (selectedDistrictRow) {
            const apiCities = locationRows
                .filter(item => item.type === 'city' && item.parentId === selectedDistrictRow.id)
                .map(item => item.name);
            return withAdministrativeAreaOptions(mergeUnique(apiCities, CITY_VILLAGES_BY_DISTRICT[selectedDistrictRow.name] || []));
        }

        if (selectedProvinceRow) {
            const districtIds = new Set(locationRows
                .filter(item => item.type === 'district' && item.parentId === selectedProvinceRow.id)
                .map(item => item.id));
            const apiCities = locationRows
                .filter(item => item.type === 'city' && item.parentId !== null && districtIds.has(item.parentId))
                .map(item => item.name);
            const fallbackCities = districtOptions.flatMap(districtName => CITY_VILLAGES_BY_DISTRICT[districtName] || []);
            return withAdministrativeAreaOptions(mergeUnique(apiCities, fallbackCities));
        }

        const selectedDistrictFallback = CITY_VILLAGES_BY_DISTRICT[selectedDistrictName];
        if (selectedDistrictFallback) {
            return withAdministrativeAreaOptions(selectedDistrictFallback);
        }

        if (selectedProvinceName) {
            const provinceFallbackCities = districtOptions.flatMap(districtName => CITY_VILLAGES_BY_DISTRICT[districtName] || []);
            return withAdministrativeAreaOptions(mergeUnique(provinceFallbackCities, cityList));
        }

        return withAdministrativeAreaOptions(mergeUnique(cityList, allFallbackCityVillages()));
    }, [cityList, districtOptions, locationRows, selectedDistrictName, selectedDistrictRow, selectedProvinceName, selectedProvinceRow]);

    const filteredCities = cityVillage
        ? cityOptions.filter(city => city.toLowerCase().includes(cityVillage.toLowerCase()))
        : cityOptions;

    const chipStyle: React.CSSProperties = {
        padding: '6px 14px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '500',
        color: '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0
    };

    const clearProvince = () => {
        setProvince('');
        setDistrict('');
        setCityVillage('');
        setErrors(prev => ({ ...prev, province: '', district: '' }));
    };

    const clearDistrict = () => {
        setDistrict('');
        setCityVillage('');
        setErrors(prev => ({ ...prev, district: '' }));
    };

    const syncProvinceFromDistrict = (districtName: string) => {
        const nextProvince = normalizedDistrictMap.get(districtName.trim().toLowerCase());
        if (nextProvince) {
            setProvince(nextProvince);
        }
    };

    const syncProvinceAndDistrictFromCity = (cityName: string) => {
        const match = normalizedCityMap.get(cityName.trim().toLowerCase());
        if (match) {
            setProvince(match.province);
            setDistrict(match.district);
        }
    };

    if (!unlocked) return null;

    return (
        <div id="section-2" style={{ padding: '0 0 60px 0', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--color-primary-light)', marginBottom: '48px', borderBottom: '4px solid var(--color-primary)', paddingBottom: '20px', width: '100%' }}>
                2. Location Information
            </h2>

            <div style={{ marginBottom: '40px' }}>
                <FormLabel>Address Information</FormLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="Province"
                            name="province"
                            placeholder="Type to search province..."
                            required
                            value={province}
                            onChange={(e) => {
                                setProvince(e.target.value);
                                setDistrict('');
                                setCityVillage('');
                                setErrors(prev => ({ ...prev, province: '' }));
                            }}
                            error={errors.province}
                        />
                        {filteredProvinces.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {province && (
                                    <button
                                        type="button"
                                        onClick={clearProvince}
                                        style={{
                                            ...chipStyle,
                                            background: '#fff7ed',
                                            borderColor: '#fdba74',
                                            color: '#9a3412'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.borderColor = '#fb923c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fdba74'; }}
                                    >
                                        Clear
                                    </button>
                                )}
                                {filteredProvinces.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => {
                                            setProvince(p);
                                            setDistrict('');
                                            setCityVillage('');
                                            setErrors(prev => ({ ...prev, province: '' }));
                                        }}
                                        style={chipStyle}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="District"
                            name="district"
                            placeholder="Type to search district..."
                            required
                            value={district}
                            onChange={(e) => {
                                const nextDistrict = e.target.value;
                                setDistrict(nextDistrict);
                                setCityVillage('');
                                setErrors(prev => ({ ...prev, district: '' }));
                                if (nextDistrict.trim()) {
                                    syncProvinceFromDistrict(nextDistrict);
                                }
                            }}
                            error={errors.district}
                        />
                        {filteredDistricts.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {district && (
                                    <button
                                        type="button"
                                        onClick={clearDistrict}
                                        style={{
                                            ...chipStyle,
                                            background: '#fff7ed',
                                            borderColor: '#fdba74',
                                            color: '#9a3412'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.borderColor = '#fb923c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fdba74'; }}
                                    >
                                        Clear
                                    </button>
                                )}
                                {filteredDistricts.map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => {
                                            setDistrict(d);
                                            setCityVillage('');
                                            syncProvinceFromDistrict(d);
                                            setErrors(prev => ({ ...prev, district: '' }));
                                        }}
                                        style={chipStyle}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="City/Village"
                            name="cityVillage"
                            placeholder="City/Village"
                            required
                            value={cityVillage}
                            onChange={(e) => {
                                const nextCity = e.target.value;
                                setCityVillage(nextCity);
                                setErrors(prev => ({ ...prev, cityVillage: '' }));
                                if (nextCity.trim()) {
                                    syncProvinceAndDistrictFromCity(nextCity);
                                }
                            }}
                            error={errors.cityVillage}
                        />
                        {filteredCities.length > 0 && (
                            <div
                                className="hide-scrollbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: '8px',
                                    marginTop: '8px',
                                    paddingBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {cityVillage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCityVillage('');
                                            setErrors(prev => ({ ...prev, cityVillage: '' }));
                                        }}
                                        style={{
                                            ...chipStyle,
                                            background: '#fff7ed',
                                            borderColor: '#fdba74',
                                            color: '#9a3412'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ffedd5'; e.currentTarget.style.borderColor = '#fb923c'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fdba74'; }}
                                    >
                                        Clear
                                    </button>
                                )}
                                {filteredCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => {
                                            setCityVillage(city);
                                            syncProvinceAndDistrictFromCity(city);
                                            setErrors(prev => ({ ...prev, cityVillage: '' }));
                                        }}
                                        style={chipStyle}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Input label="Area" name="area" placeholder="Area" required value={area} onChange={(e) => { setArea(e.target.value); setErrors(prev => ({ ...prev, area: '' })); }} error={errors.area} />
                    <Input label="Ward Number" name="ward" placeholder="e.g. 8" value={ward} onChange={(e) => setWard(e.target.value)} />
                    <Input label="Landmark" name="landmark" placeholder="e.g. Behind Big Mart" value={landmark} onChange={(e) => setLandmark(e.target.value)} />

                    <GeoLocationInput
                        value={locationSource}
                        onChange={handleLocationSourceChange}
                        onFetch={fetchCoordinates}
                        onClear={() => {
                            setCoords({ lat: '', lng: '' });
                            setLocationSource('');
                        }}
                        hasCoords={!!coords.lat}
                        isFetching={fetchingCoords}
                        latitude={coords.lat}
                        longitude={coords.lng}
                    />
                </div>
            </div>

            {locationLoadError && (
                <div style={{ marginTop: '12px', color: '#b91c1c', fontSize: '0.9rem' }}>
                    {locationLoadError}
                </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onComplete} style={{ padding: '16px 40px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}>Continue to Nearby Location →</button>
            </div>
        </div>
    );
};
