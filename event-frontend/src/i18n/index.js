import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      
      "appName": "Event Management",
      "welcome": "Welcome",
      "myProfile": "My Profile",
      "logout": "Logout",
      "login": "Login",
      
      
      "events": "Events",
      "eventDetails": "Event Details",
      "register": "Register",
      "createAccount": "Create Account",
      "firstName": "First Name",
      "lastName": "Last Name",
      "email": "Email",
      "password": "Password",
      "submit": "Submit",
      "startTime": "Start Time",
      "endTime": "End Time",
      "location": "Location",
      "organizer": "Organizer",
      "description": "Description",
      "uploadDocument": "Upload Document",
      "searchEvents": "Search Events...",
      "noEvents": "No events found",
      "loading": "Loading...",
      "error": "An error occurred",
      "registrationSuccess": "Registration successful!",
      "loginSuccess": "Login successful!",
      "heroSubtitle": "Discover, register, and participate in events with accessibility in mind. Our platform ensures everyone can enjoy events regardless of their needs.",
      "exploreEvents": "Explore Events",
      "joinCommunity": "Join Community",
      "noEventsMatch": "No events match your search.",
      "registerDescription": "Register for an account to manage your event participation",
      "creatingAccount": "Creating Account...",
      
      
      "viewDetails": "View Details",
      "noDescription": "No description available",
      "backToEvents": "Back to Events",
      "dateTime": "Date & Time",
      "start": "Start",
      "end": "End",
      "venue": "Venue",
      "address": "Address",
      "capacity": "Capacity",
      "website": "Website",
      "accessibilityFeatures": "Accessibility Features",
      "noAccessibilityFeatures": "No specific accessibility features listed for this event.",
      "accessibilityInquiries": "For accessibility inquiries, please contact the event organizer."
    }
  },
  de: {
    translation: {
      
      "appName": "Event Management",
      "welcome": "Willkommen",
      "myProfile": "Mein Profil",
      "logout": "Abmelden",
      "login": "Anmelden",
      
      
      "events": "Veranstaltungen",
      "eventDetails": "Veranstaltungsdetails",
      "register": "Registrieren",
      "createAccount": "Konto erstellen",
      "firstName": "Vorname",
      "lastName": "Nachname",
      "email": "E-Mail",
      "password": "Passwort",
      "submit": "Absenden",
      "startTime": "Startzeit",
      "endTime": "Endzeit",
      "location": "Ort",
      "organizer": "Veranstalter",
      "description": "Beschreibung",
      "uploadDocument": "Dokument hochladen",
      "searchEvents": "Veranstaltungen suchen...",
      "noEvents": "Keine Veranstaltungen gefunden",
      "loading": "Lädt...",
      "error": "Ein Fehler ist aufgetreten",
      "registrationSuccess": "Registrierung erfolgreich!",
      "loginSuccess": "Anmeldung erfolgreich!",
      "heroSubtitle": "Entdecken, registrieren und an Veranstaltungen teilnehmen mit Fokus auf Barrierefreiheit. Unsere Plattform stellt sicher, dass jeder Veranstaltungen genießen kann, unabhängig von seinen Bedürfnissen.",
      "exploreEvents": "Veranstaltungen entdecken",
      "joinCommunity": "Community beitreten",
      "noEventsMatch": "Keine Veranstaltungen entsprechen Ihrer Suche.",
      "registerDescription": "Registrieren Sie sich für ein Konto, um Ihre Veranstaltungsteilnahme zu verwalten",
      "creatingAccount": "Konto wird erstellt...",
      
      
      "viewDetails": "Details anzeigen",
      "noDescription": "Keine Beschreibung verfügbar",
      "backToEvents": "Zurück zu Veranstaltungen",
      "dateTime": "Datum & Uhrzeit",
      "start": "Beginn",
      "end": "Ende",
      "venue": "Veranstaltungsort",
      "address": "Adresse",
      "capacity": "Kapazität",
      "website": "Webseite",
      "accessibilityFeatures": "Barrierefreiheitsmerkmale",
      "noAccessibilityFeatures": "Für diese Veranstaltung sind keine spezifischen Barrierefreiheitsmerkmale aufgeführt.",
      "accessibilityInquiries": "Bei Fragen zur Barrierefreiheit wenden Sie sich bitte an den Veranstalter."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;