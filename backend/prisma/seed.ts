import { PrismaClient, UserRole, PropertyType, VehicleType, ListingType, FuelType, Transmission, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Image placeholder en base64 (petit carré gris)
const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function main() {
  console.log('Seeding database...');

  // Nettoyer la base de données
  await prisma.favorite.deleteMany();
  await prisma.image.deleteMany();
  await prisma.property.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Créer les utilisateurs
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Jean Dupont',
      phone: '+33612345678',
      role: UserRole.USER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin System',
      phone: '+33698765432',
      role: UserRole.ADMIN,
    },
  });

  console.log('Users created:', { user: user.email, admin: admin.email });

  // Créer les propriétés
  const properties = [
    {
      title: 'Appartement T3 lumineux - Centre-ville',
      description: 'Magnifique appartement de 75m² situé en plein centre-ville. Lumineux et traversant, il comprend un séjour spacieux, 2 chambres, une cuisine équipée et une salle de bain moderne. Proche de toutes commodités.',
      price: 285000,
      address: '15 rue de la République',
      city: 'Lyon',
      zipCode: '69001',
      country: 'France',
      surface: 75,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 1,
      type: PropertyType.APARTMENT,
      listingType: ListingType.SALE,
      features: ['Balcon', 'Parking', 'Cave', 'Ascenseur', 'Digicode'],
      userId: user.id,
    },
    {
      title: 'Maison familiale avec jardin',
      description: 'Belle maison de 150m² avec jardin de 500m². 4 chambres, 2 salles de bain, garage double. Quartier calme et résidentiel, proche écoles et transports.',
      price: 450000,
      address: '42 avenue des Lilas',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France',
      surface: 150,
      rooms: 6,
      bedrooms: 4,
      bathrooms: 2,
      type: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      features: ['Jardin', 'Garage', 'Terrasse', 'Piscine', 'Alarme'],
      userId: user.id,
    },
    {
      title: 'Studio meublé - Quartier étudiant',
      description: 'Studio entièrement meublé et équipé de 25m². Idéal pour étudiant. Kitchenette, salle d\'eau, coin nuit. Charges comprises.',
      price: 550,
      address: '8 rue des Étudiants',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France',
      surface: 25,
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      type: PropertyType.STUDIO,
      listingType: ListingType.RENT,
      features: ['Meublé', 'Internet', 'Charges comprises'],
      userId: admin.id,
    },
    {
      title: 'Loft industriel rénové',
      description: 'Superbe loft de 180m² dans une ancienne usine rénovée. Volumes exceptionnels avec 4m de hauteur sous plafond. Style industriel chic.',
      price: 520000,
      address: '23 rue de l\'Industrie',
      city: 'Nantes',
      zipCode: '44000',
      country: 'France',
      surface: 180,
      rooms: 4,
      bedrooms: 2,
      bathrooms: 2,
      type: PropertyType.LOFT,
      listingType: ListingType.SALE,
      features: ['Hauteur sous plafond', 'Parquet', 'Climatisation', 'Parking'],
      userId: user.id,
    },
    {
      title: 'Villa contemporaine vue mer',
      description: 'Villa d\'architecte de 250m² avec vue imprenable sur la mer. 5 chambres, piscine à débordement, jardin paysager de 1000m².',
      price: 1250000,
      address: '1 chemin des Crêtes',
      city: 'Nice',
      zipCode: '06000',
      country: 'France',
      surface: 250,
      rooms: 7,
      bedrooms: 5,
      bathrooms: 3,
      type: PropertyType.VILLA,
      listingType: ListingType.SALE,
      features: ['Vue mer', 'Piscine', 'Jardin', 'Climatisation', 'Domotique', 'Garage'],
      userId: admin.id,
    },
    {
      title: 'Appartement T2 rénové',
      description: 'Charmant T2 de 45m² entièrement rénové. Séjour lumineux, chambre avec placards, cuisine américaine équipée. Proche métro.',
      price: 189000,
      address: '56 boulevard Haussmann',
      city: 'Paris',
      zipCode: '75008',
      country: 'France',
      surface: 45,
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      type: PropertyType.APARTMENT,
      listingType: ListingType.SALE,
      features: ['Rénové', 'Parquet', 'Double vitrage', 'Interphone'],
      userId: user.id,
    },
    {
      title: 'Local commercial - Emplacement premium',
      description: 'Local commercial de 120m² sur rue passante. Vitrine de 8m, arrière-boutique, sanitaires. Idéal commerce de proximité ou bureau.',
      price: 2500,
      address: '78 rue du Commerce',
      city: 'Marseille',
      zipCode: '13001',
      country: 'France',
      surface: 120,
      rooms: 3,
      bedrooms: 0,
      bathrooms: 1,
      type: PropertyType.COMMERCIAL,
      listingType: ListingType.RENT,
      features: ['Vitrine', 'Climatisation', 'Alarme', 'Accès handicapé'],
      userId: admin.id,
    },
    {
      title: 'Terrain constructible viabilisé',
      description: 'Terrain de 800m² viabilisé dans lotissement calme. Proche centre-ville et commodités. CU positif. Possibilité construction jusqu\'à 200m².',
      price: 95000,
      address: 'Lotissement Les Oliviers',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France',
      surface: 800,
      rooms: 0,
      bedrooms: 0,
      bathrooms: 0,
      type: PropertyType.LAND,
      listingType: ListingType.SALE,
      features: ['Viabilisé', 'Plat', 'Exposition Sud'],
      userId: user.id,
    },
    {
      title: 'Bureau moderne open space',
      description: 'Espace de bureau de 200m² en open space avec 2 salles de réunion. Climatisation, fibre optique, parkings. Immeuble récent.',
      price: 3500,
      address: '10 avenue des Affaires',
      city: 'Lille',
      zipCode: '59000',
      country: 'France',
      surface: 200,
      rooms: 5,
      bedrooms: 0,
      bathrooms: 2,
      type: PropertyType.OFFICE,
      listingType: ListingType.RENT,
      features: ['Climatisation', 'Fibre optique', 'Parking', 'Accès handicapé', 'Sécurité 24h'],
      userId: admin.id,
    },
    {
      title: 'Appartement T4 familial',
      description: 'Grand appartement familial de 95m² avec 3 chambres. Séjour double, cuisine séparée, 2 balcons. Résidence sécurisée avec gardien.',
      price: 1200,
      address: '34 rue des Familles',
      city: 'Strasbourg',
      zipCode: '67000',
      country: 'France',
      surface: 95,
      rooms: 4,
      bedrooms: 3,
      bathrooms: 1,
      type: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      features: ['Balcon', 'Cave', 'Gardien', 'Parking', 'Ascenseur'],
      userId: user.id,
    },
  ];

  for (const propertyData of properties) {
    await prisma.property.create({
      data: {
        ...propertyData,
        status: ListingStatus.ACTIVE,
        images: {
          create: [
            { data: placeholderImage, mimeType: 'image/png' },
            { data: placeholderImage, mimeType: 'image/png' },
          ],
        },
      },
    });
  }

  console.log('Properties created:', properties.length);

  // Créer les véhicules
  const vehicles = [
    {
      title: 'Renault Clio 5 essence - Comme neuve',
      description: 'Renault Clio 5 de 2022, première main, carnet d\'entretien complet. Faible kilométrage, parfait état intérieur et extérieur.',
      price: 15900,
      brand: 'Renault',
      model: 'Clio 5',
      year: 2022,
      mileage: 25000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.MANUAL,
      color: 'Blanc Glacier',
      doors: 5,
      seats: 5,
      power: 100,
      type: VehicleType.CAR,
      listingType: ListingType.SALE,
      city: 'Paris',
      features: ['GPS', 'Climatisation automatique', 'Bluetooth', 'Caméra de recul', 'Régulateur de vitesse'],
      userId: user.id,
    },
    {
      title: 'BMW Série 3 320d - Full options',
      description: 'Magnifique BMW Série 3 320d de 2021. Finition Luxury, toutes options. Véhicule suivi en concession.',
      price: 35000,
      brand: 'BMW',
      model: 'Série 3 320d',
      year: 2021,
      mileage: 45000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      color: 'Noir Saphir',
      doors: 4,
      seats: 5,
      power: 190,
      type: VehicleType.CAR,
      listingType: ListingType.SALE,
      city: 'Lyon',
      features: ['Cuir', 'Toit ouvrant', 'GPS', 'Sièges chauffants', 'Park Assist', 'Apple CarPlay'],
      userId: admin.id,
    },
    {
      title: 'Peugeot 3008 GT Line Hybrid',
      description: 'SUV Peugeot 3008 hybride rechargeable. Économique et confortable. Autonomie électrique 50km.',
      price: 32000,
      brand: 'Peugeot',
      model: '3008 GT Line',
      year: 2023,
      mileage: 15000,
      fuelType: FuelType.HYBRID,
      transmission: Transmission.AUTOMATIC,
      color: 'Gris Artense',
      doors: 5,
      seats: 5,
      power: 225,
      type: VehicleType.SUV,
      listingType: ListingType.SALE,
      city: 'Bordeaux',
      features: ['i-Cockpit', 'Night Vision', 'Grip Control', 'Hayon électrique', 'Chargeur embarqué'],
      userId: user.id,
    },
    {
      title: 'Tesla Model 3 Long Range',
      description: 'Tesla Model 3 Long Range de 2022. Autopilot, supercharge gratuite à vie. Batterie en excellent état.',
      price: 42000,
      brand: 'Tesla',
      model: 'Model 3 Long Range',
      year: 2022,
      mileage: 30000,
      fuelType: FuelType.ELECTRIC,
      transmission: Transmission.AUTOMATIC,
      color: 'Blanc Nacré',
      doors: 4,
      seats: 5,
      power: 440,
      type: VehicleType.CAR,
      listingType: ListingType.SALE,
      city: 'Nice',
      features: ['Autopilot', 'Supercharge gratuit', 'Intérieur blanc', 'Jantes 19"', 'Attelage'],
      userId: admin.id,
    },
    {
      title: 'Yamaha MT-07 - Parfait état',
      description: 'Yamaha MT-07 de 2021, 8000 km. Premier propriétaire, jamais chuté. Avec accessoires.',
      price: 6500,
      brand: 'Yamaha',
      model: 'MT-07',
      year: 2021,
      mileage: 8000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.MANUAL,
      color: 'Bleu Racing',
      doors: 0,
      seats: 2,
      power: 75,
      type: VehicleType.MOTORCYCLE,
      listingType: ListingType.SALE,
      city: 'Toulouse',
      features: ['ABS', 'Quickshifter', 'Pot Akrapovic', 'Protège-réservoir', 'Béquille atelier'],
      userId: user.id,
    },
    {
      title: 'Location - Citroën C3 automatique',
      description: 'Citroën C3 automatique disponible à la location. Parfait pour vos déplacements en ville. Assurance tous risques incluse.',
      price: 35,
      brand: 'Citroën',
      model: 'C3',
      year: 2023,
      mileage: 5000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      color: 'Rouge Elixir',
      doors: 5,
      seats: 5,
      power: 83,
      type: VehicleType.CAR,
      listingType: ListingType.RENT,
      city: 'Marseille',
      features: ['Climatisation', 'Bluetooth', 'Assurance incluse', 'Kilométrage illimité'],
      userId: admin.id,
    },
    {
      title: 'Volkswagen Transporter T6',
      description: 'VW Transporter T6 aménagé en van. Idéal pour voyager. Lit, cuisine, panneau solaire.',
      price: 45000,
      brand: 'Volkswagen',
      model: 'Transporter T6',
      year: 2020,
      mileage: 60000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      color: 'Blanc Candy',
      doors: 4,
      seats: 4,
      power: 150,
      type: VehicleType.VAN,
      listingType: ListingType.SALE,
      city: 'Nantes',
      features: ['Aménagé', 'Panneau solaire', 'Cuisine équipée', 'Lit double', 'Douche extérieure'],
      userId: user.id,
    },
    {
      title: 'Mercedes Classe A 200 AMG Line',
      description: 'Mercedes Classe A finition AMG Line. Look sportif, intérieur premium. Garantie constructeur.',
      price: 28000,
      brand: 'Mercedes-Benz',
      model: 'Classe A 200',
      year: 2022,
      mileage: 20000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      color: 'Gris Montagne',
      doors: 5,
      seats: 5,
      power: 163,
      type: VehicleType.CAR,
      listingType: ListingType.SALE,
      city: 'Lille',
      features: ['MBUX', 'Pack AMG', 'LED', 'Jantes 18"', 'Caméra 360°'],
      userId: admin.id,
    },
    {
      title: 'Vespa Primavera 125 - Édition spéciale',
      description: 'Vespa Primavera 125cc édition spéciale. Design italien iconique. Parfait état.',
      price: 4200,
      brand: 'Vespa',
      model: 'Primavera 125',
      year: 2022,
      mileage: 3000,
      fuelType: FuelType.PETROL,
      transmission: Transmission.AUTOMATIC,
      color: 'Vert Relax',
      doors: 0,
      seats: 2,
      power: 12,
      type: VehicleType.SCOOTER,
      listingType: ListingType.SALE,
      city: 'Montpellier',
      features: ['ABS', 'Tablier', 'Top case', 'Pare-brise'],
      userId: user.id,
    },
    {
      title: 'Ford Ranger Wildtrak - Pick-up',
      description: 'Ford Ranger Wildtrak double cabine. Idéal travail et loisirs. Capacité de charge importante.',
      price: 38000,
      brand: 'Ford',
      model: 'Ranger Wildtrak',
      year: 2021,
      mileage: 55000,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      color: 'Orange Saber',
      doors: 4,
      seats: 5,
      power: 213,
      type: VehicleType.TRUCK,
      listingType: ListingType.SALE,
      city: 'Strasbourg',
      features: ['4x4', 'Hard-top', 'Crochet attelage', 'SYNC 3', 'Caméra de recul'],
      userId: admin.id,
    },
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.create({
      data: {
        ...vehicleData,
        status: ListingStatus.ACTIVE,
        images: {
          create: [
            { data: placeholderImage, mimeType: 'image/png' },
            { data: placeholderImage, mimeType: 'image/png' },
          ],
        },
      },
    });
  }

  console.log('Vehicles created:', vehicles.length);

  console.log('Seeding completed!');
  console.log('\nTest accounts:');
  console.log('- User: user@example.com / Password123!');
  console.log('- Admin: admin@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
