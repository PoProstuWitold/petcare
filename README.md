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

Przykładowe zwierzęta:
- **Sara** - suczka, właściciel: user,
- **Yuki** - kotka, właściciel: user,
- **Abi** - suczka, właściciel: vet,
- **Harry** - pies, właściciel: admin.

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

DO ZROBIENIA

<p align="right">(<a href="#top">przewiń do góry</a>)</p>

---

## Zasady SOLID

DO ZROBIENIA

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

DO ZROBIENIA

<p align="right">(<a href="#top">przewiń do góry</a>)</p>