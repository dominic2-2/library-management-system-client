import { BookWithDetails } from "@/types/book";

// Sample data based on the database schema
export const sampleBooksData: BookWithDetails[] = [
  {
    book_id: 1,
    title: "Carrie",
    language: "English",
    book_status: "Active",
    description: "A classic horror novel about a telekinetic teenager",
    category_id: 1,
    category_name: "Horror",
    authors: [
      {
        author_id: 1,
        author_name: "Stephen King",
        bio: "American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels",
      },
    ],
    volumes: [
      {
        volume_id: 1,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 1,
            isbn: "9788440218209",
            publication_year: 1974,
            price: 12.99,
            publisher_name: "Doubleday",
            edition_name: "First Edition",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Classic edition",
          },
        ],
      },
    ],
    total_copies: 10,
    available_copies: 8,
    borrowed_copies: 2,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 2,
    title: "Cosmos: A Personal Voyage",
    language: "English",
    book_status: "Active",
    description: "An exploration of the universe and our place in it",
    category_id: 2,
    category_name: "Science",
    authors: [
      {
        author_id: 2,
        author_name: "Carl Sagan",
        bio: "American astronomer, cosmologist, astrophysicist, astrobiologist, author, science popularizer, and science communicator",
      },
    ],
    volumes: [
      {
        volume_id: 2,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 2,
            isbn: "9781542994309",
            publication_year: 1980,
            price: 15.99,
            publisher_name: "Random House",
            edition_name: "Revised Edition",
            cover_type_name: "Hardcover",
            paper_quality_name: "Premium",
            notes: "Illustrated edition",
          },
        ],
      },
    ],
    total_copies: 22,
    available_copies: 20,
    borrowed_copies: 2,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 3,
    title: "Ender's Game",
    language: "English",
    book_status: "Active",
    description:
      "A military science fiction novel about a young boy trained to fight in an interstellar war",
    category_id: 3,
    category_name: "Science Fiction",
    authors: [
      {
        author_id: 3,
        author_name: "Orson Scott Card",
        bio: "American novelist, critic, public speaker, essayist, and columnist",
      },
    ],
    volumes: [
      {
        volume_id: 3,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 3,
            isbn: "9788378396321",
            publication_year: 1985,
            price: 13.99,
            publisher_name: "Tor Books",
            edition_name: "Mass Market",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Classic sci-fi",
          },
        ],
      },
    ],
    total_copies: 33,
    available_copies: 31,
    borrowed_copies: 2,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 4,
    title: "The Complete Works of Shakespeare",
    language: "English",
    book_status: "Active",
    description: "Complete collection of Shakespeare's plays and sonnets",
    category_id: 4,
    category_name: "Drama",
    authors: [
      {
        author_id: 4,
        author_name: "William Shakespeare",
        bio: "English playwright, poet, and actor, widely regarded as the greatest writer in the English language",
      },
    ],
    volumes: [
      {
        volume_id: 4,
        volume_number: 1,
        volume_title: "Comedies",
        variants: [
          {
            variant_id: 4,
            isbn: "9788892551466",
            publication_year: 2020,
            price: 25.99,
            publisher_name: "Oxford University Press",
            edition_name: "Annotated Edition",
            cover_type_name: "Hardcover",
            paper_quality_name: "Premium",
            notes: "Includes commentary",
          },
        ],
      },
      {
        volume_id: 5,
        volume_number: 2,
        volume_title: "Tragedies",
        variants: [
          {
            variant_id: 5,
            isbn: "9788892551467",
            publication_year: 2020,
            price: 25.99,
            publisher_name: "Oxford University Press",
            edition_name: "Annotated Edition",
            cover_type_name: "Hardcover",
            paper_quality_name: "Premium",
            notes: "Includes commentary",
          },
        ],
      },
    ],
    total_copies: 32,
    available_copies: 30,
    borrowed_copies: 2,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 5,
    title: "I Am America (And So Can You)",
    language: "English",
    book_status: "Inactive",
    description: "A satirical book about American politics and culture",
    category_id: 5,
    category_name: "Satire",
    authors: [
      {
        author_id: 5,
        author_name: "Stephen Colbert",
        bio: "American comedian, writer, producer, political commentator, actor, and television host",
      },
    ],
    volumes: [
      {
        volume_id: 6,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 6,
            isbn: "9780753537879",
            publication_year: 2007,
            price: 9.99,
            publisher_name: "Grand Central Publishing",
            edition_name: "First Edition",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Comedy bestseller",
          },
        ],
      },
    ],
    total_copies: 7,
    available_copies: 7,
    borrowed_copies: 0,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 6,
    title: "Jurassic Park",
    language: "English",
    book_status: "Active",
    description:
      "A science fiction thriller about a theme park of cloned dinosaurs",
    category_id: 6,
    category_name: "Action And Adventure",
    authors: [
      {
        author_id: 6,
        author_name: "Michael Crichton",
        bio: "American author, screenwriter, and film director known for science fiction, thrillers, and medical fiction",
      },
    ],
    volumes: [
      {
        volume_id: 7,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 7,
            isbn: "9788497597807",
            publication_year: 1990,
            price: 14.99,
            publisher_name: "Knopf",
            edition_name: "First Edition",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Bestselling thriller",
          },
          {
            variant_id: 8,
            isbn: "9788497597808",
            publication_year: 1990,
            price: 22.99,
            publisher_name: "Knopf",
            edition_name: "Collector's Edition",
            cover_type_name: "Hardcover",
            paper_quality_name: "Premium",
            notes: "Special collector's edition",
          },
        ],
      },
    ],
    total_copies: 34,
    available_copies: 32,
    borrowed_copies: 2,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 7,
    title: "Modern Art In America 1908-68",
    language: "English",
    book_status: "Active",
    description: "Comprehensive overview of modern art movements in America",
    category_id: 7,
    category_name: "Art",
    authors: [
      {
        author_id: 7,
        author_name: "William C. Agee",
        bio: "American art historian and curator specializing in 20th-century American art",
      },
    ],
    volumes: [
      {
        volume_id: 8,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 9,
            isbn: "9780714875248",
            publication_year: 2016,
            price: 45.99,
            publisher_name: "Phaidon Press",
            edition_name: "First Edition",
            cover_type_name: "Hardcover",
            paper_quality_name: "Art Quality",
            notes: "Full-color illustrations",
          },
        ],
      },
    ],
    total_copies: 42,
    available_copies: 38,
    borrowed_copies: 4,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 8,
    title: "The 4-Hour Body",
    language: "English",
    book_status: "Active",
    description:
      "An uncommon guide to rapid fat-loss, incredible sex, and becoming superhuman",
    category_id: 8,
    category_name: "Health",
    authors: [
      {
        author_id: 8,
        author_name: "Timothy Ferriss",
        bio: "American entrepreneur, investor, author, and podcaster",
      },
    ],
    volumes: [
      {
        volume_id: 9,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 10,
            isbn: "9788466650212",
            publication_year: 2010,
            price: 16.99,
            publisher_name: "Crown Archetype",
            edition_name: "First Edition",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Self-help bestseller",
          },
        ],
      },
    ],
    total_copies: 14,
    available_copies: 13,
    borrowed_copies: 1,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 9,
    title: "The Last Black Unicorn",
    language: "English",
    book_status: "Active",
    description: "A memoir filled with humor and heart",
    category_id: 9,
    category_name: "Biographies",
    authors: [
      {
        author_id: 9,
        author_name: "Tiffany Haddish",
        bio: "American comedian and actress",
      },
    ],
    volumes: [
      {
        volume_id: 10,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 11,
            isbn: "9781501181849",
            publication_year: 2017,
            price: 12.99,
            publisher_name: "Gallery Books",
            edition_name: "First Edition",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Comedy memoir",
          },
        ],
      },
    ],
    total_copies: 24,
    available_copies: 20,
    borrowed_copies: 4,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
  {
    book_id: 10,
    title: "The Midnight Line",
    language: "English",
    book_status: "Active",
    description: "A Jack Reacher novel",
    category_id: 10,
    category_name: "Mystery",
    authors: [
      {
        author_id: 10,
        author_name: "Lee Child",
        bio: "British author who writes thriller novels",
      },
    ],
    volumes: [
      {
        volume_id: 11,
        volume_number: 1,
        volume_title: undefined,
        variants: [
          {
            variant_id: 12,
            isbn: "9781524774288",
            publication_year: 2017,
            price: 11.99,
            publisher_name: "Delacorte Press",
            edition_name: "First Edition",
            cover_type_name: "Paperback",
            paper_quality_name: "Standard",
            notes: "Jack Reacher series #22",
          },
        ],
      },
    ],
    total_copies: 18,
    available_copies: 15,
    borrowed_copies: 3,
    reserved_copies: 0,
    damaged_copies: 0,
    lost_copies: 0,
  },
];

// API functions (using sample data for now)
export const fetchBooks = async (): Promise<BookWithDetails[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return sampleBooksData;
};

export const searchBooks = async (
  query: string
): Promise<BookWithDetails[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return sampleBooksData.filter(
    (book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.category_name.toLowerCase().includes(query.toLowerCase()) ||
      book.authors.some((author) =>
        author.author_name.toLowerCase().includes(query.toLowerCase())
      )
  );
};

export const deleteBook = async (bookId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // In real implementation, this would make an API call
  console.log(`Deleting book with ID: ${bookId}`);
};

export const getBookById = async (
  bookId: number
): Promise<BookWithDetails | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return sampleBooksData.find((book) => book.book_id === bookId) || null;
};
