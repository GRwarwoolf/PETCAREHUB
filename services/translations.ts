

import { Language } from "../types";

export const translations = {
  en: {
    // General
    "app.title": "PetCare Hub",
    "app.subtitle": "Your AI assistant for a happier, healthier pet!",
    "btn.back": "Back",
    "btn.save": "Save",
    "btn.cancel": "Cancel",
    "btn.delete": "Delete",
    "btn.edit": "Edit",
    "loading.ai": "Consulting AI Specialist...",
    "loading.analyzing": "Analyzing your pet...",
    "loading.posting": "Posting...",
    "loading.safety": "Performing safety check...",
    
    // Navbar
    "nav.home": "Home",
    "nav.health": "Health",
    "nav.community": "Community",
    "nav.profile": "Profile",

    // Auth
    "auth.google": "Sign in with Google",
    "auth.apple": "Sign in with Apple",
    "auth.guest": "Continue as Guest",

    // Language
    "lang.select": "Choose your language",

    // Pet ID
    "petid.title": "Let's meet your pet!",
    "petid.subtitle": "Take a photo so our AI can identify the breed.",
    "petid.takePhoto": "Tap to take photo",
    "petid.identified": "Identified",
    "petid.name": "Name",
    "petid.age": "Age (Years)",
    "petid.gender": "Gender",
    "petid.male": "Male",
    "petid.female": "Female",
    "petid.create": "Create Profile",

    // Dashboard
    "home.breedInfo": "Breed Info",
    "home.training": "Training",
    "home.nutrition": "Nutrition",
    "home.specialTraits": "Special Traits",
    "home.healthLog": "Health Log",
    "home.activityIdeas": "Activity Ideas",
    "home.vetTips": "Vet Tips",
    "home.community": "Community",

    // Nutrition Sub-menu
    "nutrition.menu.general": "General Guidelines",
    "nutrition.menu.recipes": "Homemade Recipes",
    "nutrition.general.title": "Nutrition Advice",
    "nutrition.recipes.title": "Homemade Recipes & Treats",

    // Training
    "training.listTitle": "Training & Commands",
    "training.subtitle": "Step-by-step guides for",
    "training.req": "What you need",
    "training.steps": "Step-by-step",
    "training.tips": "Tips & Common Mistakes",
    
    // Commands
    "cmd.sit": "Sit",
    "cmd.stay": "Stay",
    "cmd.come": "Come",
    "cmd.down": "Down",
    "cmd.heel": "Heel",
    "cmd.leaveit": "Leave It",
    "cmd.fetch": "Fetch",
    "cmd.crate": "Crate Training",
    "cmd.potty": "Potty Training",
    "cmd.social": "Socialization",
    "cmd.litter": "Litter Box",

    // Health
    "health.title": "Health Log",
    "health.subtitle": "Vitals & Tracking",
    "health.weight": "Weight History",
    "health.last6": "Weight Trend",
    "health.vaccines": "Medical Entries",
    "health.add": "Add Entry",
    "health.addWeight": "Add Weight",
    "health.empty": "No health records yet.",
    "health.emptyWeight": "No weight records yet.",
    "health.deleteConfirm": "Are you sure you want to delete this entry?",
    "health.form.title": "New Entry",
    "health.form.editTitle": "Edit Entry",
    "health.form.weightTitle": "New Weight Entry",
    "health.form.editWeightTitle": "Edit Weight Entry",
    "health.field.type": "Type",
    "health.field.date": "Date",
    "health.field.title": "Title (e.g. Rabies Shot)",
    "health.field.weight": "Weight (kg)",
    "health.field.notes": "Notes",
    "health.type.vaccine": "Vaccine",
    "health.type.vet": "Vet Visit",
    "health.type.medication": "Medication",
    "health.type.symptom": "Symptom",
    "health.type.other": "Other",

    // Community
    "comm.title": "Pet Community",
    "comm.feed": "Feed",
    "comm.myposts": "My Posts",
    "comm.newPost": "New Post",
    "comm.addPhoto": "Add Photo",
    "comm.captionPlaceholder": "Write something about your pet...",
    "comm.postBtn": "Post",
    "comm.like": "Like",
    "comm.comment": "Comment",
    "comm.writeComment": "Write a comment...",
    "comm.send": "Send",
    "comm.guest": "Guest",
    "comm.safetyError": "This image cannot be posted because it may contain inappropriate content.",

    // Profile
    "profile.title": "My Profile",
    "profile.guest": "Guest User",
    "profile.location": "Location",
    "profile.petDetails": "Pet Details",
    "profile.logout": "Log Out",
    "profile.changeLang": "Language",
    "profile.legal": "Legal",

    // Legal
    "legal.title": "Legal Information",
    "legal.privacy": "Privacy Policy",
    "legal.terms": "Terms of Use",
    "legal.cookies": "Cookie Policy",
    "legal.placeholder": "This is a placeholder for legal content. In a real application, the full legal text would appear here.",

    // AI Chat
    "chat.title": "AI Assistant",
    "chat.welcome": "Hello! I'm your personal AI expert. Ask me anything about {name}—health, training, behavior, or nutrition!",
    "chat.placeholder": "Ask about {name}...",
    "chat.typing": "Typing...",
    "chat.trigger": "Ask AI about {name}...",
  },
  el: {
    // General
    "app.title": "PetCare Hub",
    "app.subtitle": "Ο AI βοηθός σου για ένα χαρούμενο κατοικίδιο!",
    "btn.back": "Πίσω",
    "btn.save": "Αποθήκευση",
    "btn.cancel": "Ακύρωση",
    "btn.delete": "Διαγραφή",
    "btn.edit": "Επεξεργασία",
    "loading.ai": "Συμβουλεύομαι τον AI ειδικό...",
    "loading.analyzing": "Ανάλυση κατοικίδιου...",
    "loading.posting": "Δημοσίευση...",
    "loading.safety": "Έλεγχος ασφαλείας...",

    // Navbar
    "nav.home": "Αρχική",
    "nav.health": "Υγεία",
    "nav.community": "Κοινότητα",
    "nav.profile": "Προφίλ",

    // Auth
    "auth.google": "Σύνδεση με Google",
    "auth.apple": "Σύνδεση με Apple",
    "auth.guest": "Συνέχεια ως Επισκέπτης",

    // Language
    "lang.select": "Επίλεξε γλώσσα",

    // Pet ID
    "petid.title": "Ας γνωρίσουμε το ζώο σου!",
    "petid.subtitle": "Βγάλε μια φωτογραφία για να βρούμε τη ράτσα.",
    "petid.takePhoto": "Πάτα για φωτογραφία",
    "petid.identified": "Αναγνωρίστηκε",
    "petid.name": "Όνομα",
    "petid.age": "Ηλικία (Έτη)",
    "petid.gender": "Φύλο",
    "petid.male": "Αρσενικό",
    "petid.female": "Θηλυκό",
    "petid.create": "Δημιουργία Προφίλ",

    // Dashboard
    "home.breedInfo": "Πληροφορίες Ράτσας",
    "home.training": "Εκπαίδευση",
    "home.nutrition": "Διατροφή",
    "home.specialTraits": "Ιδιαίτερα Χαρακτηριστικά",
    "home.healthLog": "Ημερολόγιο Υγείας",
    "home.activityIdeas": "Ιδέες Δραστηριοτήτων",
    "home.vetTips": "Συμβουλές Κτηνιάτρου",
    "home.community": "Κοινότητα",

    // Nutrition Sub-menu
    "nutrition.menu.general": "Γενικές Συμβουλές",
    "nutrition.menu.recipes": "Σπιτικές Συνταγές",
    "nutrition.general.title": "Διατροφικές Συμβουλές",
    "nutrition.recipes.title": "Σπιτικές Συνταγές & Λιχουδιές",

    // Training
    "training.listTitle": "Εκπαίδευση & Εντολές",
    "training.subtitle": "Οδηγοί βήμα-προς-βήμα για",
    "training.req": "Τι θα χρειαστείς",
    "training.steps": "Βήμα-βήμα",
    "training.tips": "Συμβουλές & Συχνά Λάθη",

    // Commands
    "cmd.sit": "Κάτσε",
    "cmd.stay": "Μείνε",
    "cmd.come": "Έλα",
    "cmd.down": "Κάτω",
    "cmd.heel": "Δίπλα",
    "cmd.leaveit": "Άστο",
    "cmd.fetch": "Φέρτο",
    "cmd.crate": "Εκπαίδευση Κλουβιού",
    "cmd.potty": "Εκπαίδευση Τουαλέτας",
    "cmd.social": "Κοινωνικοποίηση",
    "cmd.litter": "Άμμος Γάτας",

    // Health
    "health.title": "Ημερολόγιο Υγείας",
    "health.subtitle": "Ζωτικά Σημεία",
    "health.weight": "Ιστορικό Βάρους",
    "health.last6": "Τάση Βάρους",
    "health.vaccines": "Ιατρικές Καταχωρήσεις",
    "health.add": "Νέα Καταχώρηση",
    "health.addWeight": "Νέο Βάρος",
    "health.empty": "Δεν υπάρχουν καταχωρήσεις.",
    "health.emptyWeight": "Δεν υπάρχουν μετρήσεις βάρους.",
    "health.deleteConfirm": "Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την καταχώρηση;",
    "health.form.title": "Νέα Καταχώρηση",
    "health.form.editTitle": "Επεξεργασία",
    "health.form.weightTitle": "Νέα Μέτρηση Βάρους",
    "health.form.editWeightTitle": "Επεξεργασία Βάρους",
    "health.field.type": "Τύπος",
    "health.field.date": "Ημερομηνία",
    "health.field.title": "Τίτλος (π.χ. Αντιλυσσικό)",
    "health.field.weight": "Βάρος (kg)",
    "health.field.notes": "Σημειώσεις",
    "health.type.vaccine": "Εμβόλιο",
    "health.type.vet": "Κτηνίατρος",
    "health.type.medication": "Φάρμακο",
    "health.type.symptom": "Σύμπτωμα",
    "health.type.other": "Άλλο",

    // Community
    "comm.title": "Κοινότητα PetCare",
    "comm.feed": "Ροή",
    "comm.myposts": "Τα Post μου",
    "comm.newPost": "Νέο Post",
    "comm.addPhoto": "Πρόσθεσε φωτογραφία",
    "comm.captionPlaceholder": "Γράψε κάτι για το κατοικίδιό σου...",
    "comm.postBtn": "Δημοσίευση",
    "comm.like": "Μου αρέσει",
    "comm.comment": "Σχόλιο",
    "comm.writeComment": "Γράψε ένα σχόλιο...",
    "comm.send": "Αποστολή",
    "comm.guest": "Επισκέπτης",
    "comm.safetyError": "Αυτή η εικόνα δεν μπορεί να δημοσιευτεί γιατί μπορεί να περιέχει ακατάλληλο περιεχόμενο.",

    // Profile
    "profile.title": "Το Προφίλ μου",
    "profile.guest": "Επισκέπτης",
    "profile.location": "Περιοχή",
    "profile.petDetails": "Στοιχεία Κατοικίδιου",
    "profile.logout": "Αποσύνδεση",
    "profile.changeLang": "Γλώσσα",
    "profile.legal": "Νομικά",

    // Legal
    "legal.title": "Νομικές Πληροφορίες",
    "legal.privacy": "Πολιτική Απορρήτου",
    "legal.terms": "Όροι Χρήσης",
    "legal.cookies": "Πολιτική Cookies",
    "legal.placeholder": "Αυτό είναι ένα δείγμα κειμένου για νομικό περιεχόμενο. Σε μια πραγματική εφαρμογή, εδώ θα εμφανιζόταν το πλήρες κείμενο.",

    // AI Chat
    "chat.title": "AI Βοηθός",
    "chat.welcome": "Γεια! Είμαι ο προσωπικός σου AI ειδικός. Ρώτα με ό,τι θες για το {name}—υγεία, εκπαίδευση ή διατροφή!",
    "chat.placeholder": "Ρώτα για το {name}...",
    "chat.typing": "Πληκτρολογεί...",
    "chat.trigger": "Ρώτα το AI για το {name}...",
  }
};

export const t = (key: string, lang: Language, params?: Record<string, string>): string => {
  // @ts-ignore
  let text = translations[lang][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
    });
  }
  return text;
};