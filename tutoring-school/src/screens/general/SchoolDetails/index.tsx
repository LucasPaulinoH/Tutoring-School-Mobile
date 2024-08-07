import { View, Image } from "react-native";
import { School } from "../../../services/School/type";
import * as SecureStore from "expo-secure-store";
import { Button, Card, Icon, Input, Text } from "@ui-kitten/components";
import styles from "./styles";
import QRCode from "react-native-qrcode-svg";
import { useEffect, useState } from "react";
import schoolApi from "../../../services/School";
import { Student } from "../../../services/Student/type";
import studentApi from "../../../services/Student";
import { SearchIcon, UnlinkSchoolIcon } from "../../../theme/Icons";
import { useAuth } from "../../../context/AuthContext";
import { UserRole } from "../../../types/Types";

const TutorSchoolDetails = ({ navigation }: any) => {
  const selectedSchoolId: string = JSON.parse(
    SecureStore.getItem("selectedSchoolId")!
  );

  const { authState } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");

  const [school, setSchool] = useState<School>({} as School);
  const [students, setStudents] = useState<Student[]>([]);

  const fetchSchool = async () => {
    try {
      const schoolResponse = await schoolApi.getSchool(selectedSchoolId);
      setSchool(schoolResponse);
    } catch (error) {
      console.error("Error fetching school: ", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsResponse = await studentApi.getStudentsFromSchool(
        selectedSchoolId
      );
      setStudents(studentsResponse);
    } catch (error) {
      console.error("Error fetching school: ", error);
    }
  };

  const handleUnlinkFromSchool = async (studentId: string) => {
    try {
      await studentApi.unlinkStudentFromSchool(studentId);
      fetchStudents();
    } catch (error) {
      console.error("Error unlinking student from school: ", error);
    }
  };

  const handleStudentDetailsClick = (studentId: string) => {
    SecureStore.setItem("selectedStudentId", JSON.stringify(studentId));
    navigation.navigate("StudentDetails");
  };

  useEffect(() => {
    fetchSchool();
  }, []);

  const isUserTutor = () => {
    return authState?.user?.role === UserRole.TUTOR;
  };

  useEffect(() => {
    if (isUserTutor()) fetchStudents();
  }, [school]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View>
      <Image source={{ uri: school.profileImage }} width={400} height={300} />
      <Text category="h5">{school.name}</Text>
      <Text category="s1" style={{ textAlign: "justify" }}>
        {school.description}
      </Text>

      <View style={styles.contactInfoContainer}>
        <Icon name="phone-outline" style={styles.icons} />
        <Text>{school.phone}</Text>
      </View>
      <View style={styles.contactInfoContainer}>
        <Icon name="email-outline" style={styles.icons} />
        <Text>{school.email}</Text>
      </View>
      <View style={styles.contactInfoContainer}>
        <Icon name="navigation-2-outline" style={styles.icons} />
        <Text
          style={{ textAlign: "justify" }}
        >{`${school.address}, ${school.addressNumber} - ${school.district}, ${school.city} - ${school.state}`}</Text>
      </View>

      {isUserTutor() ? <QRCode value={school.id} /> : null}
      {students.length > 0 && isUserTutor() ? (
        <>
          <Text category="h6">Alunos desta escola</Text>
          <Input
            placeholder="Buscar estudantes..."
            accessoryLeft={SearchIcon}
            value={searchTerm}
            onChangeText={(search) => setSearchTerm(search)}
          />
          {filteredStudents.map((student: Student) => (
            <Card
              key={student.id}
              onPress={() => handleStudentDetailsClick(student.id!)}
            >
              <View style={styles.studentCard}>
                <View style={styles.studentCardFirstHalf}>
                  <View style={styles.studentNameAndLinked}>
                    <Text category="h6">{student.name}</Text>
                  </View>
                  <View style={styles.pendentTasksIconAndLabel}></View>
                </View>

                <View>
                  <Button
                    accessoryLeft={UnlinkSchoolIcon}
                    onPress={() => handleUnlinkFromSchool(student.id!)}
                    appearance="ghost"
                  />
                </View>
              </View>
            </Card>
          ))}
        </>
      ) : students.length === 0 && isUserTutor() ? (
        <Text>Não há alunos vinculados a esta escola ainda.</Text>
      ) : null}
    </View>
  );
};

export default TutorSchoolDetails;
