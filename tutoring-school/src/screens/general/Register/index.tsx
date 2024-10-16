import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Avatar, Button, Input, Text, useTheme } from "@ui-kitten/components";
import RoleSelectCard from "../../../components/RoleSelectCard";
import { useAuth } from "../../../context/AuthContext";
import { UserRole } from "../../../types/Types";
import userApi from "../../../services/User";
import {
  handleSetSingleSelectedImageState,
  uploadImageToFirebase,
} from "../../../utils/imageFunctions";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerValidationSchema } from "../../../validations/register";
import { StyleSheet } from "react-native";
import { EditIcon } from "../../../theme/Icons";
import userIcon from "../../../../assets/user.png";
import { APP_NAME } from "../../../utils/stringUtils";
import BackPageButton from "../../../components/BackPageButton";

const Register = ({ navigation }: any) => {
  const auth = useAuth();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerValidationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.TUTOR);

  const handleRoleClick = (role: UserRole) => {
    setRole(role);
  };

  const handleFinishFirstStep = (formData: any) => {
    setUserData({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    setCurrentStep(1);
  };

  const handleRegistration = async () => {
    try {
      const newUserData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role,
        password: userData.password,
      };

      const createdUser = await auth.onRegister!(newUserData);

      if (createdUser && profileImage !== null) {
        const newUserProfileImageUrl = await uploadImageToFirebase(
          profileImage,
          `users/${createdUser.id}`
        );

        await userApi.updateUserProfileImage(
          createdUser.id,
          newUserProfileImageUrl!
        );
      }

      navigation.navigate("Login");
    } catch (error) {
      console.error("Error during registration: ", error);
    }
  };

  const renderFirstStep = (
    <View style={styles.innerContainer}>
      <View style={{ alignSelf: "flex-start", marginBottom: -15 }}>
        <BackPageButton onPress={() => navigation.goBack()} />
      </View>
      <Text category="h3">{APP_NAME}</Text>
      <Text category="h5">1. Preencha os dados de usuário</Text>
      <Avatar
        style={styles.avatar}
        size="giant"
        source={profileImage ? { uri: profileImage } : userIcon}
      />
      <Button
        onPress={() => handleSetSingleSelectedImageState(setProfileImage)}
        accessoryLeft={EditIcon}
        style={styles.editImageButton}
      />

      <View>
        {profileImage ? (
          <Button onPress={() => setProfileImage(null)} appearance="ghost">
            <Text>Limpar imagem</Text>
          </Button>
        ) : null}
      </View>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Nome *"
            value={value}
            onChangeText={onChange}
            status={errors.firstName ? "danger" : "basic"}
            caption={errors.firstName ? errors.firstName.message : ""}
          />
        )}
        name="firstName"
      />
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Sobrenome *"
            value={value}
            onChangeText={onChange}
            status={errors.lastName ? "danger" : "basic"}
            caption={errors.lastName ? errors.lastName.message : ""}
          />
        )}
        name="lastName"
      />

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Email *"
            value={value}
            onChangeText={onChange}
            status={errors.email ? "danger" : "basic"}
            caption={errors.email ? errors.email.message : ""}
          />
        )}
        name="email"
      />

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Telefone (contato) *"
            value={value}
            onChangeText={onChange}
            status={errors.phone ? "danger" : "basic"}
            caption={errors.phone ? errors.phone.message : ""}
          />
        )}
        name="phone"
      />

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Senha *"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            status={errors.password ? "danger" : "basic"}
            caption={errors.password ? errors.password.message : ""}
          />
        )}
        name="password"
      />

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Confirme a senha *"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            status={errors.confirmPassword ? "danger" : "basic"}
            caption={
              errors.confirmPassword ? errors.confirmPassword.message : ""
            }
          />
        )}
        name="confirmPassword"
      />

      <Button onPress={handleSubmit(handleFinishFirstStep)}  style={styles.button}>Confirmar</Button>
    </View>
  );

  const renderSecondStep = (
    <View style={styles.innerContainer}>
      <View style={{ alignSelf: "flex-start" }}>
        <BackPageButton onPress={() => navigation.goBack()} />
      </View>
      <Text category="h3">{APP_NAME}</Text>
      <Text category="h5">2. Selecione o tipo de conta</Text>
      <RoleSelectCard
        role={UserRole.TUTOR}
        selected={role === UserRole.TUTOR ? true : false}
        onPress={() => handleRoleClick(UserRole.TUTOR)}
      />
      <RoleSelectCard
        role={UserRole.GUARDIAN}
        selected={role === UserRole.GUARDIAN ? true : false}
        onPress={() => handleRoleClick(UserRole.GUARDIAN)}
      />

      <View style={{ width: "100%", marginTop: 20 }}>
        <Button onPress={handleRegistration} style={styles.button}>
          Finalizar cadastro
        </Button>
        <Button
          onPress={() => setCurrentStep(0)}
          style={styles.button}
          appearance="ghost"
        >
          Voltar
        </Button>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: theme["color-primary-100"] }}>
      <View style={styles.mainContainer}>
        {currentStep === 0 ? renderFirstStep : renderSecondStep}
      </View>
    </ScrollView>
  );
};

export default Register;

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    marginTop: 20,
    paddingBottom: 50,
  },
  innerContainer: {
    width: "90%",
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#F7A8B0",
  },
  editImageButton: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginTop: -60,
    marginLeft: 100,
  },
  button: {
    width: "100%",
  },
});
