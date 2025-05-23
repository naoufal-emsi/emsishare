from rest_framework import serializers
from .models import User, Domain, Subject, Question, Answer, Room, QuizQuestion, Participant, Response, Score

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile_picture', 'profile_picture_mime', 'last_login', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        exclude = ['created_by']
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'
    
    def validate(self, data):
        if Subject.objects.filter(domain=data['domain'], subject_name=data['subject_name']).exists():
            raise serializers.ValidationError("Subject with this name already exists in the domain")
        return data

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'

class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Response
        fields = '__all__'

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = '__all__'