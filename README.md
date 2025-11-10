<a id="top"></a>

# [PL] PetCare
## System do zarządzania wizytami u weterynarza i profilami zwierząt.

**Autor:** Witold Zawada (indywidualny projekt)

**Technologia:** Spring Boot + Spring Security + React (Vite) + H2 (Flyway)  

**Wersja Java oraz JDK:** 21

---

## Spis treści
1. [Opis projektu](#opis-projektu)
2. [Architektura](#architektura)
3. [Aplikacja](#aplikacja)
4. [Zasady SOLID](#zasady-solid)
5. [Testy](#testy)
6. [Technologie](#technologie)
7. [REST API](#rest-api)

---

## Opis projektu

**PetCare** to aplikacja webowa w architekturze **klient–serwer**, której celem jest zarządzanie zwierzętami, ich profilami oraz wizytami u weterynarza. System umożliwia logowanie, przeglądanie oraz zarządzanie danymi przez różne role użytkowników (`USER`, `VET`, `ADMIN`).

**Konta testowe i dane przykładowe**
Aby szybciej rozpocząć pracę z aplikacją, w trybie deweloperskim automatycznie tworzone są konta testowe oraz przykładowe dane.

Konta użytkowników:
- **Administrator:** - username: `admin`, password: `admin12345678`,
- **Weterynarz:** - username: `vet`, password: `vet12345678`,
- **Użytkownik:** - username: `user`, password: `user12345678`.

Zwierzęta:
- **Sara** - suczka, właściciel: user,
- **Yuki** - kotka, właściciel: user,
- **Abi** - suczka, właściciel: vet,
- **Harry** - pies, właściciel: admin.

Dodatkowo tworzony jest profil weterynarza oraz jego grafik pracy.

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Architektura

Aplikacja została stworzona w modelu **klient–serwer**:
- **Klient:** aplikacja React (Vite) komunikująca się z serwerem za pomocą REST API,
- **Serwer:** aplikacja Spring Boot,
- **Baza danych:** H2 (z migracjami Flyway).

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Aplikacja

### Role
- `USER` – właściciel zwierząt, może przeglądać i dodawać swoje zwierzaki oraz wizyty.
- `VET` – weterynarz (pełni też rolę recepcjonisty), widzi wszystkie zwierzęta, wizyty i ich historię.
- `ADMIN` – administrator systemu, zarządza użytkownikami i danymi.

### Moduły

- **Status aplikacji:** sprawdzanie statusu działania aplikacji.
- **Autentykacja i autoryzacja:** rejestracja, logowanie, zarządzanie sesjami.
- **Użytkownicy:** dodawanie, edytowanie, usuwanie kont użytkowników.
- **Zwierzęta:** dodawanie, edytowanie, usuwanie profili zwierząt.
- **Wizyty:** umawianie, edytowanie, usuwanie wizyt u weterynarza.
- **Historia medyczna:** przeglądanie i zarządzanie historią medyczną zwierząt (DO ZROBIENIA).

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Zasady SOLID

Projekt został zaprojektowany zgodnie z zasadami SOLID, co zapewnia jego elastyczność, skalowalność i łatwość utrzymania. Poniżej przedstawiono, jak każda z zasad została zaimplementowana:
- **S - Single Responsibility Principle (SRP):** Każda klasa ma jedną odpowiedzialność, np. serwisy zajmują się logiką biznesową, a kontrolery obsługują żądania HTTP.
- **O - Open/Closed Principle (OCP):** System jest otwarty na rozszerzenia (np. dodawanie nowych funkcji), ale zamknięty na modyfikacje istniejącego kodu.
- **L - Liskov Substitution Principle (LSP):** Podklasy mogą być używane zamiast swoich nadklas bez zmiany poprawności programu.
- **I - Interface Segregation Principle (ISP):** Interfejsy są podzielone na mniejsze, bardziej specyficzne, co pozwala na implementację tylko tych metod, które są potrzebne.
- **D - Dependency Inversion Principle (DIP):** Moduły wysokiego poziomu nie zależą od modułów niskiego poziomu; oba zależą od abstrakcji.


<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Testy

DO ZROBIENIA

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Technologie

- **Spring Boot v3.5.6**
- **Spring Security**
- **React v19**
- **JPA**
- **Flyway (migracje)**
- **H2 Database**
- **Docker**

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## REST API

Wszystkie mają prefiks `/api`. 

Dokumentacja API jest dostępna pod adresem: `http://localhost:8080/swagger-ui/index.html`.

W nawiasie podano podprefiksy dla danej grupy endpointów wraz z ich krótkim opisem.

- **Status (`/status`)**: sprawdzenie statusu aplikacji.
- **Auth (`/auth`)**: rejestracja, logowanie, obecnie zalogowany użytkownik.
- **Users (`/users`)**: zarządzanie użytkownikami.
- **Pets (`/pets`)**: zarządzanie profilami zwierząt.
- **Visits (`/visits`)**: zarządzanie wizytami u weterynarza.
- **Medical Records (`/medical-records`)**: DO ZROBIENIA zarządzanie historią medyczną zwierząt.

<p align="right">(<a href="#top">przewiń do góry</a>)</p>