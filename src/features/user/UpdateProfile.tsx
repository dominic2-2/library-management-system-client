'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Container
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Phone,
  Email,
  Home,
  AccountCircle,
  Security,
  Verified
} from '@mui/icons-material';
import { useProfile } from './useProfile';

const UpdateProfile = () => {
  const theme = useTheme();
  const {
    formData,
    errors,
    loading,
    loadingProfile,
    hasChanges,
    handleChange,
    handleSubmit,
    handleReset,
  } = useProfile();

  if (loadingProfile) {
    return (
      <Container maxWidth="md">
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
          gap={2}
        >
          <CircularProgress size={50} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Đang tải thông tin...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                fontSize: '3rem',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              {formData.fullName || 'Người dùng'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Chip 
                icon={<Verified />} 
                label="Thành viên" 
                color="primary" 
                variant="outlined"
                sx={{ borderRadius: 3 }}
              />
              <Chip 
                icon={<Security />} 
                label="Đã xác thực" 
                color="success" 
                variant="outlined"
                sx={{ borderRadius: 3 }}
              />
            </Box>
          </Box>
        </Fade>

        {/* Main Form Card */}
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {/* Card Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white'
                  }}
                >
                  <Edit />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Thông tin cá nhân
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật thông tin để bảo mật tài khoản tốt hơn
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Grid container spacing={3}>
                  {/* Read-only Fields */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                      Thông tin cơ bản
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tên đăng nhập"
                      value={formData.username || ''}
                      disabled
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.grey[100], 0.5)
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1.5, color: 'text.secondary' }}>
                            <AccountCircle />
                          </Box>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Địa chỉ email"
                      value={formData.email || ''}
                      disabled
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.grey[100], 0.5)
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1.5, color: 'text.secondary' }}>
                            <Email />
                          </Box>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                      Thông tin có thể chỉnh sửa
                    </Typography>
                  </Grid>

                  {/* Editable Fields */}
                  <Grid item xs={12}>
                    <TextField
                      label="Họ và tên đầy đủ"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1.5, color: 'primary.main' }}>
                            <Person />
                          </Box>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1.5, color: 'primary.main' }}>
                            <Phone />
                          </Box>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Địa chỉ"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      fullWidth
                      required
                      // Bỏ multiline và rows để làm single line giống như các field khác
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1.5, color: 'primary.main' }}>
                            <Home />
                          </Box>
                        )
                      }}
                    />
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        justifyContent: 'flex-end',
                        pt: 3,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        disabled={loading || !hasChanges}
                        onClick={handleReset}
                        startIcon={<Cancel />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.main
                          }
                        }}
                      >
                        Hủy thay đổi
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !hasChanges}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`
                          },
                          '&:disabled': {
                            background: alpha(theme.palette.primary.main, 0.6),
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Additional Info Card */}
        <Fade in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 3,
              background: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="white" sx={{ lineHeight: 1.6 }}>
                💡 <strong>Lưu ý:</strong> Thông tin cá nhân được bảo mật tuyệt đối. 
                Chỉ cập nhật khi cần thiết và đảm bảo thông tin chính xác để hệ thống hoạt động tốt nhất.
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
};

export default UpdateProfile;