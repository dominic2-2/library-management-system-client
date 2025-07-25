export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string; // 2-letter country code
  cca3: string; // 3-letter country code
  flag: string; // emoji flag
  flags: {
    png: string;
    svg: string;
  };
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  flagUrl: string;
}

export class CountryService {
  private static readonly API_BASE_URL = "https://restcountries.com/v3.1";
  private static cachedCountries: CountryOption[] | null = null;

  /**
   * Get all countries from REST Countries API
   */
  static async getCountries(): Promise<CountryOption[]> {
    // Return cached data if available
    if (this.cachedCountries) {
      return this.cachedCountries;
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/all?fields=name,cca2,cca3,flag,flags`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const countries: Country[] = await response.json();

      // Transform to our format and sort alphabetically
      const countryOptions: CountryOption[] = countries
        .map((country) => ({
          code: country.cca2,
          name: country.name.common,
          flag: country.flag,
          flagUrl: country.flags.png,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Cache the results
      this.cachedCountries = countryOptions;

      return countryOptions;
    } catch (error) {
      console.error("Error fetching countries:", error);

      // Return a fallback list of common countries if API fails
      return this.getFallbackCountries();
    }
  }

  /**
   * Search countries by name
   */
  static async searchCountries(query: string): Promise<CountryOption[]> {
    const allCountries = await this.getCountries();

    if (!query.trim()) {
      return allCountries;
    }

    const searchTerm = query.toLowerCase().trim();
    return allCountries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get country by code
   */
  static async getCountryByCode(code: string): Promise<CountryOption | null> {
    const allCountries = await this.getCountries();
    return (
      allCountries.find(
        (country) => country.code.toLowerCase() === code.toLowerCase()
      ) || null
    );
  }

  /**
   * Fallback countries list in case API fails
   */
  private static getFallbackCountries(): CountryOption[] {
    return [
      { code: "AF", name: "Afghanistan", flag: "🇦🇫", flagUrl: "" },
      { code: "AL", name: "Albania", flag: "🇦🇱", flagUrl: "" },
      { code: "DZ", name: "Algeria", flag: "🇩🇿", flagUrl: "" },
      { code: "AR", name: "Argentina", flag: "🇦🇷", flagUrl: "" },
      { code: "AU", name: "Australia", flag: "🇦🇺", flagUrl: "" },
      { code: "AT", name: "Austria", flag: "🇦🇹", flagUrl: "" },
      { code: "BD", name: "Bangladesh", flag: "🇧🇩", flagUrl: "" },
      { code: "BE", name: "Belgium", flag: "🇧🇪", flagUrl: "" },
      { code: "BR", name: "Brazil", flag: "🇧🇷", flagUrl: "" },
      { code: "CA", name: "Canada", flag: "🇨🇦", flagUrl: "" },
      { code: "CN", name: "China", flag: "🇨🇳", flagUrl: "" },
      { code: "CO", name: "Colombia", flag: "🇨🇴", flagUrl: "" },
      { code: "CU", name: "Cuba", flag: "🇨🇺", flagUrl: "" },
      { code: "DK", name: "Denmark", flag: "🇩🇰", flagUrl: "" },
      { code: "EG", name: "Egypt", flag: "🇪🇬", flagUrl: "" },
      { code: "FI", name: "Finland", flag: "🇫🇮", flagUrl: "" },
      { code: "FR", name: "France", flag: "🇫🇷", flagUrl: "" },
      { code: "DE", name: "Germany", flag: "🇩🇪", flagUrl: "" },
      { code: "GR", name: "Greece", flag: "🇬🇷", flagUrl: "" },
      { code: "IN", name: "India", flag: "🇮🇳", flagUrl: "" },
      { code: "ID", name: "Indonesia", flag: "🇮🇩", flagUrl: "" },
      { code: "IR", name: "Iran", flag: "🇮🇷", flagUrl: "" },
      { code: "IQ", name: "Iraq", flag: "🇮🇶", flagUrl: "" },
      { code: "IE", name: "Ireland", flag: "🇮🇪", flagUrl: "" },
      { code: "IL", name: "Israel", flag: "🇮🇱", flagUrl: "" },
      { code: "IT", name: "Italy", flag: "🇮🇹", flagUrl: "" },
      { code: "JP", name: "Japan", flag: "🇯🇵", flagUrl: "" },
      { code: "KR", name: "Korea (South)", flag: "🇰🇷", flagUrl: "" },
      { code: "MX", name: "Mexico", flag: "🇲🇽", flagUrl: "" },
      { code: "NL", name: "Netherlands", flag: "🇳🇱", flagUrl: "" },
      { code: "NO", name: "Norway", flag: "🇳🇴", flagUrl: "" },
      { code: "PK", name: "Pakistan", flag: "🇵🇰", flagUrl: "" },
      { code: "PL", name: "Poland", flag: "🇵🇱", flagUrl: "" },
      { code: "PT", name: "Portugal", flag: "🇵🇹", flagUrl: "" },
      { code: "RU", name: "Russia", flag: "🇷🇺", flagUrl: "" },
      { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", flagUrl: "" },
      { code: "ZA", name: "South Africa", flag: "🇿🇦", flagUrl: "" },
      { code: "ES", name: "Spain", flag: "🇪🇸", flagUrl: "" },
      { code: "SE", name: "Sweden", flag: "🇸🇪", flagUrl: "" },
      { code: "CH", name: "Switzerland", flag: "🇨🇭", flagUrl: "" },
      { code: "TH", name: "Thailand", flag: "🇹🇭", flagUrl: "" },
      { code: "TR", name: "Turkey", flag: "🇹🇷", flagUrl: "" },
      { code: "UA", name: "Ukraine", flag: "🇺🇦", flagUrl: "" },
      { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", flagUrl: "" },
      { code: "GB", name: "United Kingdom", flag: "🇬🇧", flagUrl: "" },
      { code: "US", name: "United States", flag: "🇺🇸", flagUrl: "" },
      { code: "VN", name: "Vietnam", flag: "🇻🇳", flagUrl: "" },
    ].sort((a, b) => a.name.localeCompare(b.name));
  }
}
