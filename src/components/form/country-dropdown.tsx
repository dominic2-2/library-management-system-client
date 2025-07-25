"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Autocomplete,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CountryService, CountryOption } from "@/services/country-service";

interface CountryDropdownProps {
  value?: string; // Country name
  onChange: (countryName: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  label?: string;
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  value = "",
  onChange,
  disabled = false,
  error = false,
  helperText,
  placeholder = "Select nationality",
  label = "Nationality",
}) => {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null
  );
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load initial countries
  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true);
      try {
        const allCountries = await CountryService.getCountries();
        setCountries(allCountries);

        // Set initial selected country if value exists
        if (value) {
          const found = allCountries.find(
            (country) => country.name.toLowerCase() === value.toLowerCase()
          );
          setSelectedCountry(found || null);
        }
      } catch (error) {
        console.error("Error loading countries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, [value]);

  // Handle search with debouncing
  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      if (newInputValue.trim()) {
        try {
          const searchResults =
            await CountryService.searchCountries(newInputValue);
          setCountries(searchResults);
        } catch (error) {
          console.error("Error searching countries:", error);
        }
      } else {
        // Load all countries if search is empty
        try {
          const allCountries = await CountryService.getCountries();
          setCountries(allCountries);
        } catch (error) {
          console.error("Error loading countries:", error);
        }
      }
    }, 300);
  };

  // Handle selection
  const handleChange = (
    event: React.SyntheticEvent,
    newValue: CountryOption | null
  ) => {
    setSelectedCountry(newValue);
    onChange(newValue ? newValue.name : "");
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <Autocomplete
      value={selectedCountry}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={countries}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      loading={loading}
      disabled={disabled}
      noOptionsText="No countries found"
      loadingText="Loading countries..."
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fafafa",
              "& fieldset": {
                borderColor: "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: "#bdbdbd",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          {/* Flag */}
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "14px",
              bgcolor: "transparent",
            }}
            src={option.flagUrl}
            alt={`${option.name} flag`}
          >
            {option.flag}
          </Avatar>

          {/* Country name */}
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {option.code}
            </Typography>
          </Box>
        </Box>
      )}
      filterOptions={(options) => {
        // Return all options since we handle filtering on the server side
        return options;
      }}
      sx={{
        "& .MuiAutocomplete-inputRoot": {
          paddingRight: "9px !important",
        },
      }}
    />
  );
};
