"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Menu as MenuIcon,
  AccountCircle,
} from "@mui/icons-material";
import { Sidebar } from "@/components/common/sidebar";
import { AttributesTable } from "@/components/table/attributes-table";
import { AttributeForm } from "@/components/form/attribute-form";
import { CategoryService } from "@/services/category-service";
import { CoverTypeService } from "@/services/cover-type-service";
import { PaperQualityService } from "@/services/paper-quality-service";
import { PublisherService } from "@/services/publisher-service";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attributes-tabpanel-${index}`}
      aria-labelledby={`attributes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface TabData {
  title: string;
  data: Array<{ id: number; name: string }>;
  loading: boolean;
  error: string | null;
}

// Interfaces for API responses - matching actual service format
interface CategoryResponse {
  category_id: number;
  category_name: string;
}

interface CoverTypeResponse {
  cover_type_id: number;
  cover_type_name: string;
}

interface PaperQualityResponse {
  paper_quality_id: number;
  paper_quality_name: string;
}

interface PublisherResponse {
  publisher_id: number;
  publisher_name: string;
}

export default function BookAttributesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [tabsData, setTabsData] = useState<TabData[]>([
    { title: "Categories", data: [], loading: false, error: null },
    { title: "Cover Types", data: [], loading: false, error: null },
    { title: "Paper Qualities", data: [], loading: false, error: null },
    { title: "Publishers", data: [], loading: false, error: null },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Mock current user - replace with actual auth context
  const currentUser = {
    full_name: "Bwire Mashauri",
    username: "bwire.mashauri",
  };

  const fetchData = async (tabIndex: number) => {
    setTabsData((prev) =>
      prev.map((tab, index) =>
        index === tabIndex ? { ...tab, loading: true, error: null } : tab
      )
    );

    try {
      let result:
        | CategoryResponse[]
        | CoverTypeResponse[]
        | PaperQualityResponse[]
        | PublisherResponse[];
      switch (tabIndex) {
        case 0:
          result = await CategoryService.getCategories();
          break;
        case 1:
          result = await CoverTypeService.getCoverTypes();
          break;
        case 2:
          result = await PaperQualityService.getPaperQualities();
          break;
        case 3:
          result = await PublisherService.getPublishers();
          break;
        default:
          throw new Error("Invalid tab index");
      }

      // Handle the response format specifically for each attribute type
      let dataArray: Array<{ id: number; name: string }> = [];

      if (Array.isArray(result)) {
        switch (tabIndex) {
          case 0: // Categories
            dataArray = result.map((item: CategoryResponse) => ({
              id: item.category_id,
              name: item.category_name,
            }));
            break;
          case 1: // Cover Types
            dataArray = result.map((item: CoverTypeResponse) => ({
              id: item.cover_type_id,
              name: item.cover_type_name,
            }));
            break;
          case 2: // Paper Qualities
            dataArray = result.map((item: PaperQualityResponse) => ({
              id: item.paper_quality_id,
              name: item.paper_quality_name,
            }));
            break;
          case 3: // Publishers
            dataArray = result.map((item: PublisherResponse) => ({
              id: item.publisher_id,
              name: item.publisher_name,
            }));
            break;
          default:
            throw new Error("Invalid tab index");
        }
      }

      setTabsData((prev) =>
        prev.map((tab, index) =>
          index === tabIndex
            ? {
                ...tab,
                data: dataArray,
                loading: false,
              }
            : tab
        )
      );
    } catch (error) {
      console.error(`Error fetching ${tabsData[tabIndex].title}:`, error);
      setTabsData((prev) =>
        prev.map((tab, index) =>
          index === tabIndex
            ? {
                ...tab,
                loading: false,
                error:
                  error instanceof Error ? error.message : "An error occurred",
              }
            : tab
        )
      );
    }
  };

  useEffect(() => {
    fetchData(tabValue);
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (): void => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = (): void => {
    setSidebarOpen(false);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: { id: number; name: string }) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: { name: string }) => {
    const currentTab = tabsData[tabValue];

    try {
      if (editingItem) {
        // Update
        switch (tabValue) {
          case 0:
            await CategoryService.updateCategory({
              category_id: editingItem.id,
              category_name: data.name,
            });
            break;
          case 1:
            await CoverTypeService.updateCoverType({
              cover_type_id: editingItem.id,
              cover_type_name: data.name,
            });
            break;
          case 2:
            await PaperQualityService.updatePaperQuality({
              paper_quality_id: editingItem.id,
              paper_quality_name: data.name,
            });
            break;
          case 3:
            await PublisherService.updatePublisher({
              publisher_id: editingItem.id,
              publisher_name: data.name,
            });
            break;
        }
        setSnackbar({
          open: true,
          message: `${currentTab.title} updated successfully`,
          severity: "success",
        });
      } else {
        // Create
        switch (tabValue) {
          case 0:
            await CategoryService.createCategory({ category_name: data.name });
            break;
          case 1:
            await CoverTypeService.createCoverType({
              cover_type_name: data.name,
            });
            break;
          case 2:
            await PaperQualityService.createPaperQuality({
              paper_quality_name: data.name,
            });
            break;
          case 3:
            await PublisherService.createPublisher({
              publisher_name: data.name,
            });
            break;
        }
        setSnackbar({
          open: true,
          message: `${currentTab.title} created successfully`,
          severity: "success",
        });
      }

      fetchData(tabValue);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "An error occurred",
        severity: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteItemId === null) return;

    const currentTab = tabsData[tabValue];

    try {
      // Note: Delete methods may need to be implemented in services
      switch (tabValue) {
        case 0:
          // await CategoryService.deleteCategory(deleteItemId);
          console.log("Delete category:", deleteItemId);
          break;
        case 1:
          // await CoverTypeService.deleteCoverType(deleteItemId);
          console.log("Delete cover type:", deleteItemId);
          break;
        case 2:
          // await PaperQualityService.deletePaperQuality(deleteItemId);
          console.log("Delete paper quality:", deleteItemId);
          break;
        case 3:
          // await PublisherService.deletePublisher(deleteItemId);
          console.log("Delete publisher:", deleteItemId);
          break;
      }
      setSnackbar({
        open: true,
        message: `${currentTab.title} deleted successfully`,
        severity: "success",
      });
      fetchData(tabValue);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "An error occurred",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const currentTab = tabsData[tabValue];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: "#2c5aa0" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Library Management System
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">{currentUser.full_name}</Typography>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
        <Paper sx={{ p: 3 }}>
          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "medium" }}
            >
              Book Attributes Management
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="book attributes tabs"
              >
                {tabsData.map((tab, index) => (
                  <Tab key={index} label={tab.title} />
                ))}
              </Tabs>
            </Box>

            {tabsData.map((tab, index) => (
              <TabPanel key={index} value={tabValue} index={index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{tab.title} Management</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{
                      bgcolor: "#2c5aa0",
                      "&:hover": { bgcolor: "#1e3f6b" },
                    }}
                  >
                    Add {tab.title.slice(0, -1)}
                  </Button>
                </Box>

                {tab.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {tab.error}
                  </Alert>
                )}

                <AttributesTable
                  data={tab.data}
                  loading={tab.loading}
                  title={tab.title}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabPanel>
            ))}
          </Box>
        </Paper>
      </Container>

      <AttributeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        title={
          editingItem
            ? `Edit ${currentTab.title.slice(0, -1)}`
            : `Add ${currentTab.title.slice(0, -1)}`
        }
        fieldLabel={`${currentTab.title.slice(0, -1)} Name`}
        initialData={editingItem}
        isEdit={!!editingItem}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this{" "}
            {currentTab.title.slice(0, -1).toLowerCase()}? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
